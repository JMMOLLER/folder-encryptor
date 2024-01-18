import { useNotify } from '@renderer/hooks/useNotify'
import { createWsConnection } from './createWsConnection'
import { ToastContent } from '@renderer/components/ToastContent'

const notify = useNotify()

const handleUnspectedError = (res: WsResponse, operation?: LocalReq): void => {
  console.error(res.msg)
  console.log(typeof res.msg)
  let text = ''

  if (res.msg?.toString().includes('PermissionError')) {
    text = 'Permission error, try execute the app as administrator.\n\nError:\n' + res.msg
  } else {
    text = 'Unknow error, try again or reinstall the app.\n\nError:\n' + res.msg
  }

  if (operation?.deferredInstance) {
    operation.deferredInstance?.reject('Error: Unknow error.')
  } else {
    notify(Promise.reject('Error: Unknow error.'))
  }

  alert(text)
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

  let msg: MsgSocket = {
    type: operation.type,
    folder_path: operation.folder_path,
    password: operation.password
  }

  let handleMessage: ((event: MessageEvent) => Promise<void>) | undefined

  if (operation.type === 'get-content') {
    msg = { type: operation.type, folder_path: '', password: operation.password }
    handleMessage = async (event: MessageEvent): Promise<void> => {
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
  } else if (
    operation.type === 'encrypt' ||
    operation.type === 'decrypt' ||
    operation.type === 'delete'
  ) {
    handleMessage = async (event: MessageEvent): Promise<void> => {
      try {
        const res: WsResponse = JSON.parse(event.data)

        if (res.type === 'success' && res.status === 'complete') {
          operation.deferredInstance?.resolve(res.type)
        } else if (res.type === 'error' && res.status === 'complete') {
          if (res.msg?.includes('Traceback')) {
            throw new Error(res.msg)
          } else {
            operation.deferredInstance?.reject(`Error: ${res.msg}`)
          }
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
        handleUnspectedError({ msg: error } as WsResponse, operation)
        setOperation({
          type: 'get-content',
          folder_path: '',
          password: operation.password,
          deferredInstance: null
        })
      }
    }
  } else if (operation.type === 'hide' || operation.type === 'show') {
    handleMessage = async (event: MessageEvent): Promise<void> => {
      try {
        const res: WsResponse = JSON.parse(event.data)
        if (res.type === 'success') {
          operation.deferredInstance?.resolve(res.data!.toString())
        } else if (res.type === 'error') {
          operation.deferredInstance?.reject(res.msg ?? 'Unknow error.')
        }
      } catch (error) {
        handleUnspectedError({ msg: error } as WsResponse, operation)
      }
    }
  }

  if (!handleMessage) {
    throw new Error('Message handler has not been defined.')
  }

  const socket = createWsConnection({ msgToEmit: msg, onMessage: handleMessage })
  if (!operation.deferredInstance) return
  notify(operation.deferredInstance?.promise, <ToastContent operation={operation} ws={socket} />)
}
