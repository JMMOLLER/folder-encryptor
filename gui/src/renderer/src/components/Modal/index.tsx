import { Deferred } from '@renderer/utils/DeferredPromise'
import { useRef, useEffect, Validator } from 'react'
import { usePassworContext } from '@renderer/Context'
import PropTypes from 'prop-types'
import { Button } from 'antd'
import './index.css'

type ModalAddProps = {
  notify: (promise: Promise<string>) => Promise<string> | undefined
  modalProps: ModalProps
  setModalProps: (modalProps: ModalProps) => void
  operation: Operation
  setOperation: (operation: Operation) => void
  setLibraries: (libraries: Library[]) => void
}

const ModalAdd: React.FC<ModalAddProps> = ({
  modalProps,
  operation,
  setModalProps,
  setOperation,
  setLibraries,
  notify
}) => {
  const containerModalRef = useRef<HTMLFormElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const deferred = new Deferred<string>()
  const { userPass, setUserPass } = usePassworContext()
  let socket: WebSocket | null = null

  const handleClose = (): void => {
    if (containerModalRef.current && modalRef.current) {
      containerModalRef.current.classList.add('close')
      modalRef.current.classList.add('close')
      setTimeout(() => {
        setModalProps({ ...modalProps, showModal: !modalProps.showModal })
      }, 500)
    }
  }

  const handleConfirm = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!inputRef.current?.value.trim()) {
      return
    }

    notify(deferred.promise)

    if (operation === 'create-password') {
      setUserPass(inputRef.current?.value)
      deferred.resolve('')
      setLibraries([])
      handleClose()
    } else if (operation === 'encrypt') {
      socket?.send(sendMsg('encrypt', inputRef.current?.value, userPass))
    } else if (operation === 'validate-password') {
      setUserPass(inputRef.current?.value)
      deferred.resolve('')
      setOperation('get-content')
      handleClose()
    }
  }

  useEffect(() => {
    socket = new WebSocket('ws://localhost:8421/socket.io')
    socket.addEventListener('open', () => {
      console.log('Conectado al WebSocket')
    })

    socket.addEventListener('message', (event) => {
      const res: WsResponse = JSON.parse(event.data)

      console.log(res)

      if (res.type === 'success' && res.msg === 'encrypting/decrypting') {
        deferred.resolve(res.type)
        socket?.send(sendMsg('get-content', '', userPass))
      } else if (res.type === 'success' && res.msg === 'get-content') {
        if (Array.isArray(res.data)) setLibraries(res.data)
        handleClose()
      }
    })

    return () => {
      socket?.close()
    }
  }, [])

  const sendMsg = (type: MsgSocket['type'], folder_path: string, password: string): string => {
    return JSON.stringify({ type, folder_path, password })
  }

  return (
    <div className="modal" ref={modalRef}>
      <form className="container modal" ref={containerModalRef} onSubmit={handleConfirm}>
        <h2>{modalProps.title}</h2>
        <div>
          <p className="textConntent">{modalProps.textContent}</p>
          <div className="input-group">
            <input type="text" ref={inputRef} id="path" required={true} />
            <label htmlFor="path">{modalProps.textLabel}</label>
          </div>
        </div>
        <div className="buttons-container">
          <Button className="confirm" type="primary">
            Ok
          </Button>
          <Button className="close" disabled={modalProps.isRequired} onClick={handleClose} danger>
            Close
          </Button>
        </div>
      </form>
    </div>
  )
}

ModalAdd.propTypes = {
  modalProps: PropTypes.shape({
    showModal: PropTypes.bool.isRequired,
    setModalProps: PropTypes.func.isRequired,
    isRequired: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    textContent: PropTypes.string.isRequired,
    textLabel: PropTypes.string.isRequired
  }).isRequired,
  notify: PropTypes.func.isRequired,
  setModalProps: PropTypes.func.isRequired,
  operation: PropTypes.string.isRequired as Validator<Operation>,
  setOperation: PropTypes.func.isRequired,
  setLibraries: PropTypes.func.isRequired
}

export default ModalAdd
