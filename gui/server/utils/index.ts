import { spawn } from 'child_process'
import { WebSocket as WS } from 'ws'

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
  console.log('Mensaje enviado: ', { type, status, msg, data })
  return JSON.stringify({ type, status, msg, data })
}

/**
 * @summary Handles messages from client.
 *
 * @param req The request from the client.
 * @param wsIns The WebSocket instance.
 * @returns {void}
 */
const handleRequest = (req: Msg, wsIns: WS | null): void => {
  const python = spawn('python', [
    'script/main.py',
    '--function',
    req.type,
    '--folder_path',
    req.folder_path,
    '--password',
    req.password
  ])

  python.stdout.on('data', (data) => handleResponse(JSON.parse(data.toString()), wsIns))

  python.stderr.on('data', (data) => handleError(data.toString(), wsIns))
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
  wsIns?.send(renderResponse('error', 'complete', data.toString(), null))
  wsIns?.close()
}

export { handleRequest }
