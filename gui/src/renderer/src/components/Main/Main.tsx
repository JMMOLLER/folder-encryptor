import { Flex } from 'antd'
import { CardItem } from '../CardItem'
import { useEffect, useState } from 'react'

interface MainProps {
  libraries: Library[] | null
}

export function Main({ libraries }: MainProps): React.ReactElement {
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    if (libraries !== null) {
      console.log(libraries)
      setListLoading(false)
    }
  }, [libraries])

  return (
    <Flex
      wrap="wrap"
      flex={1}
      gap={16}
      style={{ alignContent: 'flex-start' }}
      className="container"
    >
      {listLoading
        ? Array(3)
            .fill({})
            .map((_, index) => <CardItem key={index} item={_} listLoading />)
        : libraries?.map((item, index) => (
            <CardItem item={item} listLoading={listLoading} key={index}></CardItem>
          ))}
    </Flex>
  )
}
