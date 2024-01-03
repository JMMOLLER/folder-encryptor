import { Flex } from 'antd'
import { CardItem } from '../CardItem'
import { useEffect, useState } from 'react'

interface MainProps {
  libraries: Library[] | null
  setOperation: (input: LocalReq) => void
  operation: LocalReq
}

export function Main({ libraries, setOperation, operation }: MainProps): React.ReactElement {
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
      {listLoading ?
        Array(3).fill({}).map((_, i) => <CardItem item={_} setOperation={setOperation} listLoading={listLoading} operation={operation} key={i}></CardItem>)
        : libraries?.map((item, i) => (
          <CardItem item={item} setOperation={setOperation} listLoading={listLoading} operation={operation} key={i}></CardItem>
        )) }
    </Flex>
  )
}
