import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import ModalAdd from './components/Modal'
import toast, { Toaster } from 'react-hot-toast'
import { PasswordContext } from './Context'
import { Main } from './components/Main/Main'
import { createWsConnection } from './utils/createWsConnection'

function App(): JSX.Element {
  const [operation, setOperation] = useState<Operation>('create-password')
  const [password, setPassword] = useState<string>('')
  const [modalProps, setModalProps] = useState<ModalProps>({
    showModal: false,
    setModalProps: (modalProps: ModalProps): void => setModalProps({ ...modalProps }),
    isRequired: true,
    title: 'Cree una contraseña',
    textContent: 'Cree una contraseña para desencriptar o encriptar una carpeta:',
    textLabel: 'Password'
  })

  const notify = (promise: Promise<string>): Promise<string> | undefined => {
    return toast.promise(promise, {
      loading: 'Loading',
      success: 'sucess',
      error: 'error'
    })
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
          showModal: true
        })
        setOperation('validate-password')
      } else {
        setModalProps({
          ...modalProps,
          showModal: true
        })
        setOperation('create-password')
      }
    }
    createWsConnection({ msgToEmit, onMessage })
  }, [])

  useEffect(() => {
    if (operation === 'get-content') {
      const msg: MsgSocket = { type: 'get-content', folder_path: '', password }
      const handleMessage = (event: MessageEvent): void => {
        try {
          const res: WsResponse = JSON.parse(event.data)
          if (res.type === 'success' && Array.isArray(res.data)) setLibraries(res.data)
          else throw new Error(res.msg)
        } catch (error) {
          console.error(error)
        }
      }

      createWsConnection({ msgToEmit: msg, onMessage: handleMessage })
    }
  }, [operation])

  const [libraries, setLibraries] = useState<Array<Library> | null>(null)

  return (
    <PasswordContext.Provider value={{ userPass: password, setUserPass: setPassword }}>
      <Nav modalProps={modalProps} setModalProps={setModalProps} setOperation={setOperation} />
      <Main libraries={libraries} />
      <Toaster position="bottom-right" reverseOrder={false} />
      {modalProps.showModal && (
        <ModalAdd
          modalProps={modalProps}
          setModalProps={setModalProps}
          notify={notify}
          operation={operation}
          setOperation={setOperation}
          setLibraries={setLibraries}
        />
      )}
    </PasswordContext.Provider>
  )
}

export default App
