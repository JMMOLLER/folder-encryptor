import { Avatar, Card, Skeleton } from 'antd'
import Meta from 'antd/es/card/Meta'
import secureFolder from '../../assets/icons/secure-folder.svg'
import { DeleteAnim, UnlockAnim } from '../LottieComponents'

type CardItemProps = {
  listLoading: boolean
  item: Library
}

export function CardItem({ listLoading, item }: CardItemProps): React.ReactElement {
  return (
    <Card
      style={{ width: 300, height: 'auto' }}
      actions={[<UnlockAnim key="decrypt" />, <DeleteAnim key="delete" />]}
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
