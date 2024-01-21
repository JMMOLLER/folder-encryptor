import { CardItem } from '../CardItem'
import { Button, Empty, Flex, Pagination, Popconfirm } from 'antd'
import { ReactNode, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePassworContext } from '@renderer/hooks/Context'
import { Deferred } from '@renderer/utils/DeferredPromise'
import './style.css'

const MotionDiv = motion.div
const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30
}
const CARD_ITEM_WIDTH = 360
const CARD_ITEM_HEIGHT = 210

interface MainProps {
  libraries: Library[] | null
  setOperation: (input: LocalReq) => void
  showConf: boolean
}

export function Main({ libraries, setOperation, showConf }: MainProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(0)
  const [listLoading, setListLoading] = useState(true)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const { userPass } = usePassworContext()

  const showPopconfirm = (): void => setIsOpen(true)
  const handleCancel = (): void => setIsOpen(false)
  const maxPageNumber = Math.ceil((libraries?.length || 0) / itemsPerPage)

  const handleOk = (): void => {
    setConfirmLoading(true)
    const deferred = new Deferred()
    setOperation({
      type: 'reset-data',
      password: userPass,
      folder_path: '',
      deferredInstance: deferred
    })

    deferred.promise.then(() => {
      setIsOpen(false)
      setConfirmLoading(false)
      setTimeout(() => location.reload(), 300)
    })
  }

  const calculateItemsPerPage = (): void => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    const itemsPerRow = Math.floor(windowWidth / CARD_ITEM_WIDTH)
    const itemsPerColumn = Math.floor(windowHeight / CARD_ITEM_HEIGHT)

    setItemsPerPage(itemsPerRow * itemsPerColumn)
  }

  const loadContent = (): ReactNode => {
    if (listLoading) {
      return Array(6)
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

      return libraries
        ?.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage)
        .map((item) => (
          <CardItem
            item={item}
            setOperation={setOperation}
            listLoading={listLoading}
            key={item.currentName}
          ></CardItem>
        ))
    }
  }

  useEffect(() => {
    calculateItemsPerPage()
    window.addEventListener('resize', calculateItemsPerPage)

    return () => {
      window.removeEventListener('resize', calculateItemsPerPage)
    }
  }, [])

  useEffect(() => {
    if (currentPage > maxPageNumber) setCurrentPage(maxPageNumber || 1)
  }, [itemsPerPage])

  useEffect(() => {
    if (libraries !== null) setListLoading(false)
    if (!listLoading) setCurrentPage(maxPageNumber)
  }, [libraries])

  return (
    <div className="main" data-showconf={showConf}>
      <MotionDiv className="main-content" layout transition={spring}>
        <div className="container folders-section">
          <Flex wrap="wrap" align="flex-start" justify="space-around">
            <AnimatePresence>{loadContent()}</AnimatePresence>
          </Flex>
          <Pagination
            current={currentPage}
            total={libraries?.length}
            pageSize={itemsPerPage}
            onChange={(e) => setCurrentPage(e)}
          />
        </div>
        <div className="container conf-section">
          <h1>Settings</h1>
          <Flex align="flex-start" justify="center">
            <p className="no-settings-text-temporary-watermark">
              No settings yet, but you can reset all data to default. 🙂
            </p>
          </Flex>
          <Popconfirm
            title="Are you sure to reset all data?"
            description={
              <>
                <p>This action cannot be undone and if you have encrypted</p>
                <p>folders they can no longer be decrypted.</p>
              </>
            }
            open={isOpen}
            onConfirm={handleOk}
            okButtonProps={{ loading: confirmLoading }}
            onCancel={handleCancel}
            placement="topLeft"
          >
            <Button type="primary" danger onClick={showPopconfirm}>
              Reset to default
            </Button>
          </Popconfirm>
        </div>
      </MotionDiv>
    </div>
  )
}
