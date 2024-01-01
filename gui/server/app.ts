import expressWs from 'express-ws'
import express, { Express } from 'express'
import { WebSocket as WS } from 'ws'
import morgan from 'morgan'
import cors from 'cors'
import { spawn } from 'child_process'

const ex: Express = express()
const app = expressWs(ex).app
const port = 8421

let wsIns: WS | null = null

type Operation = 'encrypt' | 'decrypt' | 'get-content' | 'check-librarie'
type States = 'complete' | 'pending' | 'error'

type Msg = {
  folder_path: string
  password: string
  type: Operation
}

type WsResponse = {
  type: 'error' | 'success'
  status: States
  msg: string
  data: unknown
}

type PythonResponse = {
  operation: Operation
  status: States
  data: Array<Secret> | boolean | number | null | string
}

type Secret = {
  path: string
  encrypted: boolean
  timestamp: number
  currentName: string
  originalName: string
}

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
  })
)
app.use(morgan('dev'))

app.get('/api/data', (req, res) => {
  const data = { mensaje: 'Hola desde la API' }
  res.json(data)
})

app.ws('/socket.io', (ws) => {
  ws.on('message', (msg: Msg) => {
    try {
      msg = JSON.parse(msg.toString())
      console.log('Mensaje recibido: ', msg)
      wsIns = ws
      handleRequest({ type: msg.type, folder_path: msg.folder_path, password: msg.password })
    } catch (e) {
      console.error(e)
    }
  })
})

function renderResponse(
  type: WsResponse['type'],
  status: WsResponse['status'],
  msg: WsResponse['msg'],
  data: WsResponse['data']
): string {
  return JSON.stringify({ type, status, msg, data })
}

const handleRequest = ({ type, folder_path, password }: Msg): void => {
  const python = spawn('python', [
    'script/main.py',
    '--function',
    type,
    '--folder_path',
    folder_path,
    '--password',
    password
  ])

  python.stdout.on('data', (data) => handleResponse(JSON.parse(data.toString())))

  python.stderr.on('data', (data) => handleError(data.toString()))
}

const handleResponse = (res: PythonResponse): void => {
  if (res.status === 'error' && typeof res.data === 'string') {
    wsIns?.send(renderResponse('error', 'complete', res.data.toString(), null))
  } else if (res.status === 'pending') {
    wsIns?.send(renderResponse('success', 'pending', res.operation, res.data))
  } else {
    wsIns?.send(renderResponse('success', 'complete', res.operation, res.data))
  }
}

const handleError = (data: string): void => {
  console.error(data.toString())
  wsIns?.send(renderResponse('error', 'complete', data.toString(), null))
}

app.listen(port, () => {
  console.log(`Servidor de Electron escuchando en http://localhost:${port}`)
})
