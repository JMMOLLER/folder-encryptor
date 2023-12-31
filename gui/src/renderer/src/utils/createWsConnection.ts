interface CreateWsConnectionProps {
  msgToEmit: MsgSocket
  onMessage: (event: MessageEvent) => void
}

export function createWsConnection({ msgToEmit: msg, onMessage }: CreateWsConnectionProps): void {
  const socket = new WebSocket('ws://localhost:8421/socket.io')

  socket.addEventListener('open', () => {
    console.log('Conectado al WebSocket')
    socket.send(JSON.stringify(msg))
  })

  socket.addEventListener('message', (e) => onMessage(e))
}
