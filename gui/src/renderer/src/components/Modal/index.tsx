import { Deferred } from '@renderer/utils/DeferredPromise'
import { useEffect, useRef, useState } from 'react'
import { usePassworContext } from '@renderer/hooks/Context'
import { Button, Input, InputRef } from 'antd'
import { useNotify } from '@renderer/hooks/useNotify'
import './index.css'

type ModalAddProps = {
  options: ModalOptions
  setOperation: (_: LocalReq) => void
  setLibraries: (_: Library[]) => void
  setModalOptions: (_: ModalOptions) => void
}

const ModalAdd: React.FC<ModalAddProps> = ({
  setModalOptions,
  options,
  setLibraries,
  setOperation
}: ModalAddProps) => {
  const containerModalRef = useRef<HTMLFormElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<InputRef>(null)
  const { userPass, setUserPass } = usePassworContext()
  const [inputValue, setInputValue] = useState('')
  const InputField = options.role.includes('password') ? Input.Password : Input
  const notify = useNotify()

  const handleClose = (): void => {
    if (containerModalRef.current && modalRef.current) {
      containerModalRef.current.classList.add('close')
      modalRef.current.classList.add('close')
    }
  }

  const handleConfirm = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!inputRef.current?.input) return
    if (!inputRef.current?.input.value.trim()) {
      return
    }
    const deferred = new Deferred()

    if (options.role === 'create-password') {
      setUserPass(inputValue)
      setLibraries([])
      notify(deferred.promise)
      deferred.resolve('')
    } else if (options.role === 'new-encrypt') {
      const op: LocalReq = {
        type: 'encrypt',
        folder_path: inputValue,
        password: userPass,
        deferredInstance: deferred
      }
      setOperation(op)
    } else if (options.role === 'validate-password') {
      const op: LocalReq = {
        type: 'get-content',
        folder_path: '',
        password: inputValue,
        deferredInstance: deferred
      }
      setOperation(op)
    }

    setModalOptions({ ...options, showModal: false })
  }

  useEffect(() => {
    if (options.showModal && modalRef.current && containerModalRef.current) {
      modalRef.current.classList.remove('close')
      containerModalRef.current.classList.remove('close')
    } else if (!options.showModal && modalRef.current && containerModalRef.current) {
      containerModalRef.current.classList.add('close')
      modalRef.current.classList.add('close')
      setInputValue('')
    }
  }, [options.showModal])

  return (
    <div className="modal close" ref={modalRef}>
      <form className="container modal close" ref={containerModalRef} onSubmit={handleConfirm}>
        <h2>{options.title}</h2>
        <div>
          <p className="textConntent">{options.textContent}</p>
          <div className="input-group">
            <InputField
              ref={inputRef}
              placeholder={options.textLabel}
              autoFocus={true}
              required={true}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </div>
        <div className="buttons-container">
          <Button className="confirm" type="primary">
            Ok
          </Button>
          <Button className="close" disabled={options.isRequired} onClick={handleClose} danger>
            Close
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ModalAdd
