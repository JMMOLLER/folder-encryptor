import { createContext, useContext, useState } from 'react'

export const PasswordContext = createContext<PasswordContextValue | null>(null)

export const PasswordProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [userPass, setUserPass] = useState('')

  return (
    <PasswordContext.Provider value={{ userPass, setUserPass }}>
      {children}
    </PasswordContext.Provider>
  )
}

export const usePassworContext = (): PasswordContextValue => {
  const context = useContext(PasswordContext)

  if (!context) {
    throw new Error('usePasswordContext must be used inside the PasswordProvider')
  }

  return context
}
