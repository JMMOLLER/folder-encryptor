import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import ModalAdd from './components/Modal'
import toast, { Toaster } from 'react-hot-toast'
import { PasswordContext } from './Context'
import { CardItem } from './components/CardItem'
import { Flex } from 'antd'

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
    const socket = new WebSocket('ws://localhost:8421/socket.io')
    socket.addEventListener('open', () => {
      console.log('Conectado al WebSocket')
      socket.send(JSON.stringify({ type: 'check-librarie', folder_path: '', password: '' }))
    })
    socket.addEventListener('message', (event) => {
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
    })
  }, [])

  useEffect(() => {
    if (operation === 'get-content') {
      const socket = new WebSocket('ws://localhost:8421/socket.io')
      socket.addEventListener('open', () => {
        console.log('Conectado al WebSocket')
        socket.send(JSON.stringify({ type: 'get-content', folder_path: '', password }))
      })
      socket.addEventListener('message', (event) => {
        try {
          const res: WsResponse = JSON.parse(event.data)
          if (res.type === 'success' && Array.isArray(res.data)) setLibraries(res.data)
          else throw new Error(res.msg)
        } catch (error) {
          console.error(error)
        }
      })
    }
  }, [operation])

  const [libraries, setLibraries] = useState<Array<Librarie> | null>(null)

  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    if (libraries !== null) {
      console.log(libraries)
      setListLoading(false)
    }
  }, [libraries])

  return (
    <PasswordContext.Provider value={{ userPass: password, setUserPass: setPassword }}>
      <Nav modalProps={modalProps} setModalProps={setModalProps} setOperation={setOperation} />
      <Flex
        wrap="wrap"
        flex={1}
        gap={16}
        style={{ alignContent: 'flex-start' }}
        className="container"
      >
        {listLoading
          ? Array(3)
              .fill({})
              .map((_, index) => <CardItem key={index} item={_} listLoading />)
          : libraries?.map((item, index) => (
              <CardItem item={item} listLoading={listLoading} key={index}></CardItem>
            ))}
      </Flex>
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
