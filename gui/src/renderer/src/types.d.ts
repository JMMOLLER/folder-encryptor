type ModalOptions = {
  showModal: boolean
  setModalProps: (props: ModalOptions) => void
  textContent: string
  isRequired: boolean
  textLabel: string
  title: string
  role: LocalOperation
}

type ServerOperation = 'encrypt' | 'decrypt' | 'get-content' | 'check-librarie'

type LocalOperation =
  | 'new-encrypt'
  | 'new-decrypt'
  | 'validate-password'
  | 'create-password'
  | 'get-content'
  | 'check-librarie'

type LocalReq = {
  type: 'encrypt' | 'decrypt' | 'get-content' | null
  password: string
  folder_path: string
  deferredInstance: IDeferred | null
}

interface IDeferred {
  promise: Promise<string>
  resolve: (value: string | PromiseLike<string>) => void
  reject: (reason?: string) => void
}

type PasswordContextValue = {
  userPass: string
  setUserPass: (pass: string) => void
}

interface Library {
  currentName: string
  originalName: string
  timestamp: number
  encrypted: boolean
  path: string
}

type MsgSocket = {
  type: ServerOperation
  folder_path: string
  password: string
}

type WsResponse = {
  type: 'error' | 'success'
  status: 'complete' | 'pending'
  msg: ServerOperation | string | null
  data: Array<Library> | boolean | number | null
}
