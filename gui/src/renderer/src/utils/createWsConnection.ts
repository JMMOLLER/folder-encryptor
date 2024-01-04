interface CreateWsConnectionProps {
  msgToEmit: MsgSocket
  onMessage: (event: MessageEvent) => void
}

export function createWsConnection({ msgToEmit: msg, onMessage }: CreateWsConnectionProps): WebSocket {
  const socket = new WebSocket('ws://localhost:8421/socket.io')

  socket.addEventListener('open', () => {
    console.log('Conectado al WebSocket')
    socket.send(JSON.stringify(msg))
  })

  socket.addEventListener('message', (e) => onMessage(e))

  socket.addEventListener('error', () => {
    alert('Error while connecting to server. Please, try restart the app. If the problem persists, report this problem in: https://github.com/JMMOLLER/folder-encryptor/issues')
  })

  return socket
}

export function suscribeWsConnection(socket: WebSocket, onMessage: CreateWsConnectionProps["onMessage"]){
  socket.addEventListener('open', () => {
    console.log('Suscrito al WebSocket')
  })

  socket.addEventListener('message', (e) => onMessage(e))
}
