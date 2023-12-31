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

type Operation =
  | 'encrypt'
  | 'decrypt'
  | 'validate-password'
  | 'create-password'
  | 'get-content'
  | 'check-librarie'

type Msg = {
  folder_path: string
  password: string
  type: Operation
}

type Response = {
  type: 'error' | 'success'
  status: 'complete' | 'pending'
  msg: string
  data: Array<unknown> | boolean | number | null
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
  type: Response['type'],
  status: Response['status'],
  msg: Response['msg'],
  data: Response['data']
): string {
  return JSON.stringify({ type, status, msg, data })
}

const handleRequest = ({ type, folder_path, password }: Msg): void => {
  const python = spawn('python', [
    'script/updated.py',
    '--function',
    type,
    '--folder_path',
    folder_path,
    '--password',
    password
  ])

  python.stdout.on('data', (data) => {
    console.log(data.toString())
    if (type === 'check-librarie') {
      const res = data.toString().toLowerCase()
      wsIns?.send(renderResponse('success', 'complete', 'check-librarie', /true/i.test(res)))
    } else if (type === 'get-content') {
      const res = pythonArrayToJs(data.toString())
      wsIns?.send(renderResponse('success', 'complete', 'get-content', res))
    } else {
      const progress = parseInt(data.toString())
      if (progress === 100) {
        wsIns?.send(renderResponse('success', 'complete', 'encrypting/decrypting', progress))
      } else {
        wsIns?.send(renderResponse('success', 'pending', 'encrypting/decrypting', progress))
      }
    }
  })

  python.stderr.on('data', (data) => {
    console.error(data.toString())
    wsIns?.send(renderResponse('error', 'complete', data.toString(), null))
  })
}

function pythonArrayToJs(msg: string): Array<unknown> | null {
  try {
    msg = msg.replace(/'/g, '"')
    msg = msg.replace(/True/g, 'true')
    return JSON.parse(msg)
  } catch (e) {
    console.error(e)
    return null
  }
}

app.listen(port, () => {
  console.log(`Servidor de Electron escuchando en http://localhost:${port}`)
})
