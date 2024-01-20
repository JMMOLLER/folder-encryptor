import './index.css'
import { Menu } from 'antd'
import Sider from 'antd/es/layout/Sider'
import { FolderButton, AddFolder, SettingButton } from '../Buttons'
import { useEffect, useState } from 'react'
import { getItem } from '@renderer/utils/getItem'

interface NavProps {
  modalProps: ModalOptions
  setModalProps: (modalProps: ModalOptions) => void
  showConf: boolean
  setShowConf: (_: boolean) => void
}

const Nav: React.FC<NavProps> = ({ modalProps, setModalProps, setShowConf }) => {
  const [selectedKey, setSelectedKey] = useState<string[]>(['1'])
  const [collapsed, setCollapsed] = useState(true)
  const handleShowModal = (): void => {
    setShowConf(false)
    setModalProps({
      ...modalProps,
      showModal: true,
      isRequired: false,
      title: 'Encrypt new folder',
      textContent: 'Enter the path of the folder to encrypt:',
      textLabel: 'C:/my/folder/path',
      role: 'new-encrypt'
    })
  }
  const items: MenuItem[] = [
    getItem('Folders', '1', <FolderButton />, () => setShowConf(false)),
    getItem('Add Folder', '2', <AddFolder />, () => handleShowModal()),
    getItem('Settings', '3', <SettingButton />, () => setShowConf(true))
  ]

  useEffect(() => {
    if (!modalProps.showModal) setSelectedKey(['1'])
  }, [modalProps.showModal])

  return (
    <Sider
      className="nav"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <Menu
        theme="dark"
        selectedKeys={selectedKey}
        onSelect={(e) => setSelectedKey(e.keyPath)}
        mode="inline"
        items={items}
        data-colapsed={collapsed}
      />
    </Sider>
  )
}

export default Nav
