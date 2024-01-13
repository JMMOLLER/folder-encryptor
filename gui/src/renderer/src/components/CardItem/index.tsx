import { Avatar, Card, Skeleton } from 'antd'
import Meta from 'antd/es/card/Meta'
import secureFolder from '../../assets/icons/secure-folder.svg'
import { DeleteAnim, HideShowAnim, UnlockAnim } from '../LottieComponents'
import { memo, useEffect } from 'react'
import './style.css'

type CardItemProps = {
  setOperation: (input: LocalReq) => void
  listLoading: boolean
  item: Library
}

function CardItem({ listLoading, item, setOperation }: CardItemProps): React.ReactElement {
  useEffect(() => {
    console.log(item)
  }, [item])

  return (
    <Card
      style={{ width: 360, height: 'auto' }}
      actions={[
        <UnlockAnim key="decrypt" item={item} setOperation={setOperation} />,
        <HideShowAnim key="hide/show" />,
        <DeleteAnim key="delete" />
      ]}
    >
      <Skeleton loading={listLoading} avatar active>
        <Meta
          avatar={<Avatar src={secureFolder} />}
          title="Información de la carpeta"
          description={ContentDescription(item)}
        />
      </Skeleton>
    </Card>
  )
}

function ContentDescription(item: CardItemProps['item']): React.ReactElement {
  const timestampToDate = (timestamp?: number): string => {
    if (!timestamp) return ''
    // Python timestamp is in seconds, JS timestamp is in milliseconds
    const date = new Date(timestamp * 1000)
    return date.toISOString().substring(0, 10)
  }

  const refactoredName = (name: string): string => {
    const newName = name?.substring(0, 3)
    return newName + '***'
  }

  return (
    <>
      <p className="text-card-description">
        <strong>originalName:</strong> {refactoredName(item.originalName)}
      </p>
      <p className="text-card-description">
        <strong>currentName:</strong> {item.currentName}
      </p>
      <p className="text-card-description">
        <strong>timestamp:</strong> {timestampToDate(item.timestamp)}
      </p>
    </>
  )
}

const CardItemMemo = memo(CardItem)

export { CardItemMemo }
