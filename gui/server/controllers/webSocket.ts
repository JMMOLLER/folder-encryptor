import { WebSocket as WS } from 'ws'
import { handleRequest } from '../utils'

let wsIns: WS | null = null

const wsController = (ws: WS): void => {
  ws.on('message', (msg: Msg) => {
    try {
      msg = JSON.parse(msg.toString())
      console.log('Mensaje recibido: ', msg)
      wsIns = ws
      const res = { type: msg.type, folder_path: msg.folder_path, password: msg.password }
      handleRequest(res, wsIns)
    } catch (e) {
      console.error(e)
    }
  })
}

export default wsController
