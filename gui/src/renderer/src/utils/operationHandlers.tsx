import { useNotify } from '@renderer/hooks/useNotify'
import { createWsConnection } from './createWsConnection'
import { ToastContent } from '@renderer/components/ToastContent'

const notify = useNotify()

const handleUnspectedError = (res: WsResponse): void => {
  notify(Promise.reject('Error: ' + res.msg))
  alert('Unknow error, try again or reinstall the app.\n\nError:\n' + res.msg)
}

interface handleInitRequestProps {
  setModalProps: ModalOptions['setModalProps']
  modalProps: ModalOptions
}

export function handleInitRequest(props: handleInitRequestProps): void {
  const { setModalProps, modalProps } = props

  const msgToEmit: MsgSocket = { type: 'check-librarie', folder_path: '', password: '' }
  const onMessage = (event: MessageEvent): void => {
    const res: WsResponse = JSON.parse(event.data)
    if (res.type === 'success' && res.data) {
      setModalProps({
        ...modalProps,
        title: 'Ingrese la contraseña',
        textContent: 'Ingrese la contraseña para desencriptar o encriptar una carpeta:',
        showModal: true,
        isRequired: true,
        role: 'validate-password'
      })
    } else if (res.type === 'success') {
      setModalProps({
        ...modalProps,
        showModal: true,
        role: 'create-password'
      })
    } else {
      handleUnspectedError(res)
    }
  }

  createWsConnection({ msgToEmit, onMessage })
}

interface handleOperationChangeProps {
  operation: LocalReq
  setLibraries: (_: Library[]) => void
  setPassword: (_: string) => void
  setOperation: (_: LocalReq) => void
  setModalProps: ModalOptions['setModalProps']
  modalProps: ModalOptions
}

export function handleOperationChange(props: handleOperationChangeProps): void {
  const { operation, setLibraries, setPassword, setModalProps, modalProps, setOperation } = props

  if (!operation.type) return

  if (operation.type === 'get-content') {
    const msg: MsgSocket = { type: operation.type, folder_path: '', password: operation.password }
    const handleMessage = (event: MessageEvent): void => {
      try {
        const res: WsResponse = JSON.parse(event.data)
        if (res.type === 'success' && Array.isArray(res.data)) {
          setLibraries(res.data)
          setPassword(operation.password)
          operation.deferredInstance?.resolve(res.type)
        } else if (res.type === 'error' && res.msg === 'Wrong password.') {
          setModalProps({ ...modalProps, showModal: true })
          operation.deferredInstance?.reject(res.msg)
        } else handleUnspectedError(res)
      } catch (error) {
        handleUnspectedError({ msg: 'Unknow error.' } as WsResponse)
      }
    }

    const socket = createWsConnection({ msgToEmit: msg, onMessage: handleMessage })
    if (!operation.deferredInstance) return
    notify(operation.deferredInstance?.promise, <ToastContent operation={operation} ws={socket} />)
  } else if (operation.type === 'encrypt' || operation.type === 'decrypt') {
    const msg: MsgSocket = {
      type: operation.type,
      folder_path: operation.folder_path,
      password: operation.password
    }
    const handleMessage = async (event: MessageEvent): Promise<void> => {
      try {
        const res: WsResponse = JSON.parse(event.data)

        if (res.type === 'success' && res.status === 'complete') {
          operation.deferredInstance?.resolve(res.type)
        } else if (res.type === 'error' && res.status === 'complete') {
          console.error(res.msg)
          operation.deferredInstance?.reject(`Error: ${res.msg}`)
        }
        if (res.status === 'complete') {
          setOperation({
            type: 'get-content',
            folder_path: '',
            password: operation.password,
            deferredInstance: null
          })
        }
      } catch (error) {
        console.error(error)
        setOperation({
          type: 'get-content',
          folder_path: '',
          password: operation.password,
          deferredInstance: null
        })
      }
    }

    const socket = createWsConnection({ msgToEmit: msg, onMessage: handleMessage })
    if (!operation.deferredInstance) return
    notify(operation.deferredInstance?.promise, <ToastContent operation={operation} ws={socket} />)
  }
}
