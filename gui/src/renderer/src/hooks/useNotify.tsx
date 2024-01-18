import { Id, toast } from 'react-toastify'

function notify(promise: IDeferred['promise'], jsx?: JSX.Element): Id {
  const texts = {
    loading: 'Loading',
    success: 'Success',
    error: 'Error'
  }
  const toastId = toast.loading(jsx ? jsx : texts.loading, {
    position: 'bottom-right',
    closeButton: true
  })

  promise
    .then(() => {
      toast.update(toastId, { render: texts.success, type: 'success', isLoading: false })
      setTimeout(() => toast.dismiss(toastId), 3000)
    })
    .catch((msg) => {
      toast.update(toastId, { render: msg, type: 'error', isLoading: false })
      setTimeout(() => toast.dismiss(toastId), 3000)
    })

  return toastId
}

type Notify = (promise: IDeferred['promise'], jsx?: JSX.Element) => Id

const useNotify = (): Notify => notify

export { useNotify }
