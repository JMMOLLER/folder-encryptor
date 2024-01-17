interface CreateWsConnProps {
  msgToEmit: MsgSocket
  onMessage: (event: MessageEvent) => void
}

export function createWsConnection({ msgToEmit: msg, onMessage }: CreateWsConnProps): WebSocket {
  const socket = new WebSocket('ws://localhost:8421/socket.io')

  socket.addEventListener('open', () => {
    console.log('Connection created with WebSocket')
    socket.send(JSON.stringify(msg))
  })

  socket.addEventListener('message', (e) => onMessage(e))
  socket.addEventListener('close', () => console.info('Connection closed'))

  socket.addEventListener('error', () =>
    alert(
      'Error while connecting to server. ' +
        'Please, try restart the app. If the problem persists, ' +
        'report this problem in: https://github.com/JMMOLLER/folder-encryptor/issues'
    )
  )

  return socket
}

export function suscribeWsConnection(
  socket: WebSocket,
  onMessage: CreateWsConnProps['onMessage']
): void {
  socket.addEventListener('open', () => console.log('subscribed to WebSocket'))

  socket.addEventListener('close', () => console.info('Subscription closed'))

  socket.addEventListener('message', (e) => onMessage(e))
}
