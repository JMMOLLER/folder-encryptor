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

  const { View, animationContainerRef, play, setDirection, goToAndStop, getDuration } = useLottie(
    options,
    style
  )

  useEffect(() => {
    setDirection(-1)
    const frames = getDuration(true) ?? 20
    goToAndStop(frames - 20, true)
  }, [animationContainerRef])

  const handleClick = (): void => {
    console.log('decrypt')
    play()
    const deferred = new Deferred()
    setOperation({
      folder_path: item.path,
      type: 'decrypt',
      deferredInstance: deferred,
      password: userPass
    })
  }

  return <span onClick={handleClick}>{View}</span>
}

export function DeleteAnim(): React.ReactElement {
  const options = { ...lottieOptions }
  options.animationData = deleteAnimation

  const { View, animationContainerRef, goToAndPlay } = useLottie(options, style)

  const handleClick = (): void => {
    console.log('delete')
    goToAndPlay(0, true)
  }

  useEffect(() => {
    const svgElement = animationContainerRef.current?.firstElementChild as HTMLElement
    if (svgElement) {
      svgElement.style.setProperty('height', '115%', 'important')
      svgElement.style.setProperty('transform', 'translate3d(0px, -5px, 0px)', 'important')
    }
  }, [animationContainerRef])

  return <span onClick={handleClick}>{View}</span>
}

export function HideShowAnim(): React.ReactElement {
  const options = { ...lottieOptions }
  options.animationData = hideShowAnimation

  const [isHidden, setIsHidden] = useState(false)
  const { View, animationContainerRef, goToAndPlay, setDirection, getDuration } = useLottie(
    options,
    style
  )

  const handleClick = (): void => {
    console.log('hide/show')
    if (isHidden) {
      setDirection(-1)
      const frames = getDuration(true) ?? 70
      goToAndPlay(frames - 70, true)
    } else {
      setDirection(1)
      goToAndPlay(0, true)
    }
    setIsHidden(!isHidden)
  }

  useEffect(() => {
    const svgElement = animationContainerRef.current?.firstElementChild as HTMLElement
    if (svgElement) {
      svgElement.style.setProperty('height', '140%', 'important')
      svgElement.style.setProperty('transform', 'translate3d(0px, -5px, 0px)', 'important')
    }
  }, [animationContainerRef])

  return <span onClick={handleClick}>{View}</span>
}
