import { spawn } from 'child_process'
import { WebSocket as WS } from 'ws'
import { app, dialog } from 'electron'
import fs from 'fs'
import os from 'os'
import path from 'path'

/**
 * @summary Transform JS object to string.
 *
 * @param type The type of response
 * @param status The status of response
 * @param msg The message of response
 * @param data The data of response
 * @returns {string}
 */
function renderResponse(
  type: WsResponse['type'],
  status: WsResponse['status'],
  msg: WsResponse['msg'],
  data: WsResponse['data']
): string {
  console.info('Mensaje enviado: ', { type, status, msg, data })
  return JSON.stringify({ type, status, msg, data })
}

/**
 * @summary Handles error from spawn.
 *
 * @param {Error} err The error
 */
function handleSpawnError(err: Error): void {
  appLogger(err.stack || err.toString())
  dialog.showErrorBox(err.name, err.stack || err.toString())
}

/**
 * @summary Get the path of Python script.
 *
 * @returns {string}
 */
function getScriptPath(): string {
  const executableName = getExecutableName()

  if (!executableName) throw new Error('Unsupported platform')

  return app.isPackaged
    ? path.join(process.resourcesPath, 'script', executableName)
    : path.join(__dirname, '../../script/service.py')
}

/**
 * @summary Get the name of executable file.
 *
 * @returns {string | null}
 */
function getExecutableName(): string | null {
  const platform = os.platform()

  switch (platform) {
    case 'win32':
      return 'service_x64.exe'
    default:
      return null
  }
}

const appLogger = (scriptPath: string): void => {
  fs.writeFile(`${Date.now()}.log`, scriptPath, (err) => {
    if (err) throw err
    console.info('The file has been saved!')
  })
}

/**
 * @summary Handles messages from client.
 *
 * @param req The request from the client.
 * @param wsIns The WebSocket instance.
 * @returns {void}
 */
const handleRequest = (req: Msg, wsIns: WS | null): void => {
  const scriptPath = getScriptPath()
  const command = app.isPackaged ? scriptPath : 'python'
  const options = [
    scriptPath,
    '--function',
    req.type,
    '--folder_path',
    req.folder_path,
    '--password',
    req.password
  ]

  if (app.isPackaged) options.shift()
  if (!command) throw new Error('Unsupported platform')

  const python = spawn(command, options).on('error', handleSpawnError)
  let errorMsg = ''

  python.stdout.on('data', (data) => handleResponse(JSON.parse(data.toString()), wsIns))

  python.stderr.on('data', (data) => {
    errorMsg += data.toString()
    setTimeout(() => {
      handleError(errorMsg, wsIns)
      errorMsg = ''
    }, 100)
  })
}

/**
 * @summary Handles messages from Python script.
 *
 * @param res The response from Python script
 * @param wsIns The WebSocket instance
 * @returns {void}
 */
const handleResponse = (res: PythonResponse, wsIns: WS | null): void => {
  if (res.status === 'error' && typeof res.data === 'string') {
    wsIns?.send(renderResponse('error', 'complete', res.data.toString(), null))
    wsIns?.close()
  } else if (res.status === 'pending') {
    wsIns?.send(renderResponse('success', 'pending', res.operation, res.data))
  } else {
    wsIns?.send(renderResponse('success', 'complete', res.operation, res.data))
    wsIns?.close()
  }
}

/**
 * @summary Handles unhandled error messages from Python script.
 *
 * @param data The error message
 * @param wsIns The WebSocket instance
 * @returns {void}
 */
const handleError = (data: string, wsIns: WS | null): void => {
  console.error(data.toString())
  appLogger(data.toString())
  wsIns?.send(renderResponse('error', 'complete', data.toString(), null))
  wsIns?.close()
}

export { handleRequest }
