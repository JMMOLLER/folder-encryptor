import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import ModalAdd from './components/Modal'
import { Main } from './components/Main/Main'
import { PasswordContext } from './hooks/Context'
import { ToastContainer } from 'react-toastify'
import { handleInitRequest, handleOperationChange } from './utils/operationHandlers'
import 'react-toastify/dist/ReactToastify.css'

function App(): JSX.Element {
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

  useEffect(() => {
    handleInitRequest({
      setModalProps,
      modalProps
    })
  }, [])

  useEffect(() => {
    handleOperationChange({
      setLibraries,
      setPassword,
      setModalProps,
      setOperation,
      modalProps,
      operation
    })
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
