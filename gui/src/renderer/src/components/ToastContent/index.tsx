import { suscribeWsConnection } from '@renderer/utils/createWsConnection'
import { useEffect, useState } from 'react'

type ToastContentProps = {
  operation: LocalReq
  ws: WebSocket
}

export function ToastContent({ operation, ws }: ToastContentProps): JSX.Element {
  const [text, setText] = useState('Loading...')

  useEffect(() => suscribeWsConnection(ws, handleMessage), [])

  const handleMessage = async (event: MessageEvent): Promise<void> => {
    try {
      if (operation.type === 'get-content') return
      const res: WsResponse = JSON.parse(event.data)
      console.log('Mensaje: ' + event.data.toString())
      if (res.type === 'success' && (res.msg === 'encrypt' || res.msg === 'decrypt')) {
        if (res.data === null) return
        const percent = parseFloat(res.data?.toLocaleString()).toFixed(2)
        const txt = operation.type === 'encrypt' ? 'Encrypting: ' : 'Decrypting: '
        setText(txt + percent + '%')
        if (res.status === 'complete') {
          operation.deferredInstance?.resolve(res.type)
        }
      } else if (
        res.type === 'success' &&
        (res.msg === 'hide' || res.msg === 'show' || res.msg === 'delete')
      ) {
        return
      } else throw new Error(res.msg ?? 'Unknow error.')
    } catch (error) {
      console.error(error)
    }
  }

  return <div>{text}</div>
}
