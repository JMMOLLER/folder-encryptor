import { LottieOptions, useLottie } from 'lottie-react'
import lockAnimation from '../../assets/lotties/lock.json'
import deleteAnimation from '../../assets/lotties/delete.json'
import { useEffect } from 'react'

const style = {
  height: 33
}
const lottieOptions: LottieOptions = {
  animationData: null,
  loop: false,
  autoplay: false
}

export function UnlockAnim(): React.ReactElement {
  const options = { ...lottieOptions }
  options.animationData = lockAnimation

  const { View, animationContainerRef, play, setDirection, goToAndStop, getDuration } = useLottie(
    options,
    style
  )

  const handleClick = (): void => {
    console.log('decrypt')
    play()
  }

  useEffect(() => {
    setDirection(-1)
    const frames = getDuration(true) ?? 20
    goToAndStop(frames - 20, true)
    animationContainerRef.current?.addEventListener('click', handleClick)
  }, [animationContainerRef])

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
