import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import ModalAdd from './components/Modal'
import { Main } from './components/Main/Main'
import { PasswordContext } from './hooks/Context'
import { ToastContainer } from 'react-toastify'
import { handleInitRequest, handleOperationChange } from './utils/operationHandlers'
import { Layout } from 'antd'
import 'react-toastify/dist/ReactToastify.css'

function App(): JSX.Element {
  const [password, setPassword] = useState<string>('')
  const [showConf, setShowConf] = useState<boolean>(false)
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
    title: 'Create a password',
    textContent: 'Create a password to decrypt or encrypt a folder:',
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
      <Layout>
        <Nav
          modalProps={modalProps}
          setModalProps={setModalProps}
          showConf={showConf}
          setShowConf={setShowConf}
        />
        <Main libraries={libraries} setOperation={setOperation} showConf={showConf} />
        <ToastContainer />
        <ModalAdd
          options={modalProps}
          setOperation={setOperation}
          setLibraries={setLibraries}
          setModalOptions={setModalProps}
        />
      </Layout>
    </PasswordContext.Provider>
  )
}

export default App
