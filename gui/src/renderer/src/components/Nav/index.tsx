import './index.css'
import folder from '../../assets/icons/folder.svg'
import add from '../../assets/icons/add.png'
import conf from '../../assets/icons/config.svg'
import { Button } from 'antd'

interface NavProps {
  modalProps: ModalOptions
  setModalProps: (modalProps: ModalOptions) => void
}

const Nav: React.FC<NavProps> = ({ modalProps, setModalProps }) => {
  const handleShowModal = (): void => {
    setModalProps({
      ...modalProps,
      showModal: true,
      isRequired: false,
      title: 'Encriptar nueva carpeta',
      textContent: 'Ingrese la ruta de la carpeta a encriptar:',
      textLabel: 'C:/my/folder/path',
      role: 'new-encrypt',
    })
  }

  return (
    <nav className="nav">
      <Button className="icon folder-section">
        <img src={folder} alt="folder icon" />
      </Button>
      <Button className="icon add-section" onClick={(): void => handleShowModal()}>
        <img src={add} alt="add folder" />
      </Button>
      <Button className="icon conf-section">
        <img src={conf} alt="add folder" />
      </Button>
    </nav>
  )
}

export default Nav
