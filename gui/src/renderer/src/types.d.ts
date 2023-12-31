type ModalProps = {
  showModal: boolean
  setModalProps: (props: ModalProps) => void
  isRequired: boolean
  title: string
  textContent: string
  textLabel: string
}

type Operation =
  | 'encrypt'
  | 'decrypt'
  | 'validate-password'
  | 'create-password'
  | 'get-content'
  | 'check-librarie'

interface PasswordContextValue {
  userPass: string
  setUserPass: React.Dispatch<React.SetStateAction<string>>
}

interface Librarie {
  currentName: string
  originalName: string
  timestamp: number
  encrypted: boolean
  path: string
}

type MsgSocket = {
  type: Operation
  folder_path: string
  password: string
}

type WsResponse = {
  type: 'error' | 'success'
  status: 'complete' | 'pending'
  msg: string
  data: Array<Librarie> | boolean | number | null
}
