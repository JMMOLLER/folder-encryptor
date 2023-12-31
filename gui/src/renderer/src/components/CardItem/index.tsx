import { Avatar, Card, Skeleton } from 'antd'
import Meta from 'antd/es/card/Meta'
import secureFolder from '../../assets/icons/secure-folder.svg'
import deleteIcon from '../../assets/icons/delete.svg'

type CardItemProps = {
  listLoading: boolean
  item: Librarie
}

type DeleteOutlinedProps = {
  actionKey: 'delete' | 'decrypt'
}

export function CardItem({ listLoading, item }: CardItemProps): React.ReactElement {
  return (
    <Card
      style={{ width: 300, height: 'auto' }}
      actions={[
        <CardOptions key="delete" actionKey="delete" />,
        <CardOptions key="decrypt" actionKey="decrypt" />
      ]}
    >
      <Skeleton loading={listLoading} avatar active>
        <Meta
          avatar={<Avatar src={secureFolder} />}
          title="Nombre actual de la carpeta"
          description={item.path}
        />
      </Skeleton>
    </Card>
  )
}

function CardOptions({ actionKey }: DeleteOutlinedProps): React.ReactElement {
  let icon: string | undefined

  switch (actionKey) {
    case 'delete':
      icon = deleteIcon
      break
    case 'decrypt':
      icon = secureFolder
      break
    default:
      break
  }

  const handleClick = (): void => {
    if (actionKey === 'delete') {
      console.log('delete')
    } else {
      console.log('decrypt')
    }
  }

  return <img style={{ width: '20px' }} src={icon} alt="delete" onClick={handleClick} />
}
