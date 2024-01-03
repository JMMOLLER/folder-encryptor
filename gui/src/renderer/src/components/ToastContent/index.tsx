import { suscribeWsConnection } from "@renderer/utils/createWsConnection"
import { useEffect, useState } from "react"

type ToastContentProps = {
  operation: LocalReq
}

export function ToastContent({
  operation
}: ToastContentProps) {
  const [text, setText] = useState('Loading...')

  useEffect(() => suscribeWsConnection(handleMessage), [operation])

  const handleMessage = async (event: MessageEvent): Promise<void> => {
    try {
      const res: WsResponse = JSON.parse(event.data)
      if (res.type === 'success' && (res.msg === 'encrypt' || res.msg === 'decrypt')) {
        if (res.data === null) return
        const percent = parseFloat(res.data?.toLocaleString()).toFixed(2)
        const txt = operation.type === 'encrypt' ? 'Encrypting: ' : 'Decrypting: '
        setText(txt + percent + '%')
        if (res.status === 'complete') {
          operation.deferredInstance?.resolve(res.type)
        }
      } else throw new Error(res.msg)
    } catch (error) {
      console.error(error)
    }
  }

  return <div>{text}</div>
}