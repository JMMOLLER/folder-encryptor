import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import ModalAdd from './components/Modal'
import { Main } from './components/Main/Main'
import { createWsConnection } from './utils/createWsConnection'
import { PasswordContext } from './hooks/Context'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNotify } from './hooks/useNotify'
import { ToastContent } from './components/ToastContent'

function App(): JSX.Element {
  const notify = useNotify()
  const [password, setPassword] = useState<string>('')
  const [libraries, setLibraries] = useState<Array<Library> | null>(null)
  const [operation, setOperation] = useState<LocalReq>({
    type: null,
    password: '',
    folder_path: '',
    deferredInstance: null
  })
  const [modalProps, setModalProps] = useState<ModalOptions>({
    showModal: false,
    setModalProps: (p: ModalOptions): void => setModalProps({ ...p }),
    isRequired: true,
    title: 'Cree una contraseña',
    textContent: 'Cree una contraseña para desencriptar o encriptar una carpeta:',
    textLabel: 'Password',
    role: 'check-librarie'
  })
  const handleUnspectedError = (res: WsResponse): void => {
    notify(Promise.reject('Error: ' + res.msg))
    alert("Unknow error, try again or reinstall the app.\n\nError:\n"+res.msg)
  }

  useEffect(() => {
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
          showModal: true
        })
      } else {
        handleUnspectedError(res)
      }
    }
    
    createWsConnection({ msgToEmit, onMessage })
  }, [])

  useEffect(() => {
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
          handleUnspectedError({msg: 'Unknow error.'} as WsResponse)
        }
      }

      const socket = createWsConnection({ msgToEmit: msg, onMessage: handleMessage })
      if (!operation.deferredInstance) return
      notify(operation.deferredInstance?.promise, <ToastContent operation={operation} ws={socket}/>)
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
          } else if(res.type === 'error' && res.status === 'complete') {
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
      notify(operation.deferredInstance?.promise, <ToastContent operation={operation} ws={socket}/>)
    }
  }, [operation])

  return (
    <PasswordContext.Provider value={{ userPass: password, setUserPass: setPassword }}>
      <Nav modalProps={modalProps} setModalProps={setModalProps} />
      <Main libraries={libraries} setOperation={setOperation} />
      <ToastContainer />
      <ModalAdd
        options={modalProps}
        setOperation={setOperation}
        setLibraries={setLibraries}
        setModalOptions={setModalProps}
      />
    </PasswordContext.Provider>
  )
}

export default App
