import { Avatar, Card, Skeleton } from 'antd'
import Meta from 'antd/es/card/Meta'
import secureFolder from '../../assets/icons/secure-folder.svg'
import { DeleteAnim, HideShowAnim, UnlockAnim } from '../LottieComponents'

type CardItemProps = {
  setOperation: (input: LocalReq) => void
  listLoading: boolean
  item: Library
}

export function CardItem({ listLoading, item, setOperation }: CardItemProps): React.ReactElement {
  return (
    <Card
      style={{ width: 300, height: 'auto' }}
      actions={[
        <UnlockAnim key="decrypt" item={item} setOperation={setOperation} />,
        <HideShowAnim key="hide/show" />,
        <DeleteAnim key="delete" />
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
