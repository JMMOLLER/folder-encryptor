import './index.css'
import propTypes from 'prop-types'
import folder from '../../assets/icons/folder.svg'
import add from '../../assets/icons/add.png'
import conf from '../../assets/icons/config.svg'
import { Button } from 'antd'

interface NavProps {
  modalProps: ModalProps
  setModalProps: (modalProps: ModalProps) => void
  setOperation: (operation: Operation) => void
}

const Nav: React.FC<NavProps> = ({ modalProps, setModalProps, setOperation }) => {
  const handleShowModal = (): void => {
    setModalProps({
      ...modalProps,
      showModal: true,
      isRequired: false,
      title: 'Encriptar nueva carpeta',
      textContent: 'Ingrese la ruta de la carpeta a encriptar:',
      textLabel: 'C:/my/folder/path'
    })
    setOperation('encrypt')
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

Nav.propTypes = {
  modalProps: propTypes.shape({
    showModal: propTypes.bool.isRequired,
    setModalProps: propTypes.func.isRequired,
    isRequired: propTypes.bool.isRequired,
    title: propTypes.string.isRequired,
    textContent: propTypes.string.isRequired,
    textLabel: propTypes.string.isRequired
  }).isRequired,
  setModalProps: propTypes.func.isRequired,
  setOperation: propTypes.func.isRequired
}

export default Nav
