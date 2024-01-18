type Operation =
  | 'encrypt'
  | 'decrypt'
  | 'get-content'
  | 'check-librarie'
  | 'hide'
  | 'show'
  | 'delete'
type States = 'complete' | 'pending' | 'error'

type Msg = {
  folder_path: string
  password: string
  type: Operation
}

type WsResponse = {
  type: 'error' | 'success'
  status: States
  msg: Operation | string
  data: unknown
}

type PythonResponse = {
  operation: Operation
  status: States
  data: Array<Secret> | boolean | number | null | string
}

type Secret = {
  path: string
  encrypted: boolean
  timestamp: number
  currentName: string
  originalName: string
}
