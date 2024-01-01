import { spawn } from 'child_process'
import { WebSocket as WS } from 'ws'

function renderResponse(
  type: WsResponse['type'],
  status: WsResponse['status'],
  msg: WsResponse['msg'],
  data: WsResponse['data']
): string {
  return JSON.stringify({ type, status, msg, data })
}

const handleRequest = ({ type, folder_path, password }: Msg, wsIns: WS | null): void => {
  const python = spawn('python', [
    'script/main.py',
    '--function',
    type,
    '--folder_path',
    folder_path,
    '--password',
    password
  ])

  python.stdout.on('data', (data) => handleResponse(JSON.parse(data.toString()), wsIns))

  python.stderr.on('data', (data) => handleError(data.toString(), wsIns))
}

const handleResponse = (res: PythonResponse, wsIns: WS | null): void => {
  if (res.status === 'error' && typeof res.data === 'string') {
    wsIns?.send(renderResponse('error', 'complete', res.data.toString(), null))
  } else if (res.status === 'pending') {
    wsIns?.send(renderResponse('success', 'pending', res.operation, res.data))
  } else {
    wsIns?.send(renderResponse('success', 'complete', res.operation, res.data))
  }
}

const handleError = (data: string, wsIns: WS | null): void => {
  console.error(data.toString())
  wsIns?.send(renderResponse('error', 'complete', data.toString(), null))
}

export { handleRequest }
