import { LottieOptions, useLottie } from 'lottie-react'
import lockAnimation from '../../assets/lotties/lock.json'
import deleteAnimation from '../../assets/lotties/delete.json'
import hideShowAnimation from '../../assets/lotties/hide_show.json'
import { useEffect, useState } from 'react'
import { Deferred } from '@renderer/utils/DeferredPromise'
import { usePassworContext } from '@renderer/hooks/Context'

const style = {
  height: 33
}
const lottieOptions: LottieOptions = {
  animationData: null,
  loop: false,
  autoplay: false
}

type LottieComponentProps = {
  setOperation: (input: LocalReq) => void
  item: Library
}

export function UnlockAnim({ item, setOperation }: LottieComponentProps): React.ReactElement {
  const options = { ...lottieOptions }
  options.animationData = lockAnimation

  const { userPass } = usePassworContext()

  const Lottie = useLottie(options, style)

  const handleInitial = (): void => {
    Lottie.setDirection(-1)
    const frames = Lottie.getDuration(true) ?? 20
    Lottie.goToAndStop(frames - 20, true)
  }

  useEffect(() => {
    handleInitial()
  }, [Lottie.animationContainerRef])

  const handleClick = (): void => {
    if (!item.path) return

    Lottie.play()
    const deferred = new Deferred()
    setOperation({
      folder_path: item.path,
      type: 'decrypt',
      deferredInstance: deferred,
      password: userPass
    })
    deferred.promise.catch(() => {
      Lottie.setDirection(1)
      Lottie.goToAndPlay(0, true)
      const handleError = (): void => {
        handleInitial()
        Lottie.animationItem?.removeEventListener('complete', handleError)
      }
      Lottie.animationItem?.addEventListener('complete', handleError)
    })
  }

  return <span onClick={handleClick}>{Lottie.View}</span>
}

export function DeleteAnim({ item, setOperation }: LottieComponentProps): React.ReactElement {
  const options = { ...lottieOptions }
  options.animationData = deleteAnimation

  const Lottie = useLottie(options, style)
  const { userPass } = usePassworContext()

  const handleClick = (): void => {
    if (!item.path) return

    Lottie.goToAndPlay(0, true)
    setOperation({
      folder_path: item.path,
      type: 'delete',
      password: userPass,
      deferredInstance: new Deferred()
    })
  }

  useEffect(() => {
    const svgElement = Lottie.animationContainerRef.current?.firstElementChild as HTMLElement
    if (svgElement) {
      svgElement.style.setProperty('height', '115%', 'important')
      svgElement.style.setProperty('transform', 'translate3d(0px, -5px, 0px)', 'important')
    }
  }, [Lottie.animationContainerRef])

  return <span onClick={handleClick}>{Lottie.View}</span>
}

export function HideShowAnim({ item, setOperation }: LottieComponentProps): React.ReactElement {
  const options = { ...lottieOptions }
  options.animationData = hideShowAnimation

  const { userPass } = usePassworContext()
  const [isHidden, setIsHidden] = useState(false)
  const Lottie = useLottie(options, style)

  const handleClick = (): void => {
    if (!item.path) return

    const operation = {
      folder_path: item.path,
      type: isHidden ? 'show' : 'hide',
      password: userPass,
      deferredInstance: null
    } as LocalReq

    if (isHidden) {
      setOperation(operation)
    } else {
      setOperation(operation)
    }

    runAnimation()
    setIsHidden(!isHidden)
  }

  const runAnimation = (): void => {
    if (!isHidden) {
      Lottie.setDirection(1)
      Lottie.goToAndPlay(0, true)
    } else {
      Lottie.setDirection(-1)
      const frames = Lottie.getDuration(true) ?? 70
      Lottie.goToAndPlay(frames - 70, true)
    }
  }

  useEffect(() => {
    setIsHidden(item.isHidden)
    if (item.isHidden) {
      const frames = Lottie.getDuration(true) ?? 70
      Lottie.goToAndStop(frames - 70, true)
    }
  }, [item])

  useEffect(() => {
    const svgElement = Lottie.animationContainerRef.current?.firstElementChild as HTMLElement
    if (svgElement) {
      svgElement.style.setProperty('height', '140%', 'important')
      svgElement.style.setProperty('transform', 'translate3d(0px, -5px, 0px)', 'important')
    }
  }, [Lottie.animationContainerRef])

  return <span onClick={handleClick}>{Lottie.View}</span>
}
