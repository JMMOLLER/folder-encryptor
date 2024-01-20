import { Empty, Flex } from 'antd'
import { CardItem } from '../CardItem'
import { ReactNode, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './style.css'

const MotionDiv = motion.div
const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30
}

interface MainProps {
  libraries: Library[] | null
  setOperation: (input: LocalReq) => void
  showConf: boolean
}

export function Main({ libraries, setOperation, showConf }: MainProps): React.ReactElement {
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    if (libraries !== null) {
      console.log(libraries)
      setListLoading(false)
    }
  }, [libraries])

  const loadContent = (): ReactNode => {
    if (listLoading) {
      return Array(3)
        .fill({})
        .map((_, i) => (
          <CardItem
            item={_}
            setOperation={setOperation}
            listLoading={listLoading}
            key={i}
          ></CardItem>
        ))
    } else {
      if (libraries?.length === 0) return <Empty />

      return libraries?.map((item) => (
        <CardItem
          item={item}
          setOperation={setOperation}
          listLoading={listLoading}
          key={item.currentName}
        ></CardItem>
      ))
    }
  }

  return (
    <div className="main" data-showconf={showConf}>
      <MotionDiv className="main-content" layout transition={spring}>
        <Flex
          wrap="wrap"
          flex={1}
          gap={16}
          align="flex-start"
          style={{ alignContent: 'flex-start' }}
          justify="space-around"
          className="container folders-section"
        >
          <AnimatePresence>{loadContent()}</AnimatePresence>
        </Flex>
        <div className="conf-section">
          <h1>Settings</h1>
        </div>
      </MotionDiv>
    </div>
  )
}
