import { LottieOptions, useLottie } from 'lottie-react'
import lockAnimation from '../../assets/lotties/lock.json'
import deleteAnimation from '../../assets/lotties/delete.json'
import { useEffect } from 'react'
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

  useEffect(()=> {
    if(Object.keys(item).length === 0) return
    console.log("Lottie: "+ JSON.stringify(item));
    const handleClick = (): void => {
      console.log('decrypt')
      play()
      const deferred = new Deferred()
      setOperation({ folder_path: item.path, type: 'decrypt', deferredInstance: deferred, password: userPass })
    }
    animationContainerRef.current?.addEventListener('click', handleClick)
  }, [item])

  return View
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
    animationContainerRef.current?.addEventListener('click', handleClick)
    const svgElement = animationContainerRef.current?.firstElementChild as HTMLElement
    if (svgElement) {
      svgElement.style.setProperty('height', '115%', 'important')
      svgElement.style.setProperty('transform', 'translate3d(0px, -5px, 0px)', 'important')
    }
  }, [animationContainerRef])

  return View
}
