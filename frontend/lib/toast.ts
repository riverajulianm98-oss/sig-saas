export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration: number
}

type Listener = (item: ToastItem) => void

const listeners: Listener[] = []

function emit(type: ToastType, message: string, duration: number) {
  const item: ToastItem = { id: `${Date.now()}-${Math.random()}`, type, message, duration }
  listeners.forEach((l) => l(item))
}

export function subscribeToasts(listener: Listener) {
  listeners.push(listener)
  return () => {
    const i = listeners.indexOf(listener)
    if (i >= 0) listeners.splice(i, 1)
  }
}

export const toast = {
  success: (message: string, duration = 4000) => emit('success', message, duration),
  error:   (message: string, duration = 6000) => emit('error',   message, duration),
  warning: (message: string, duration = 5000) => emit('warning', message, duration),
  info:    (message: string, duration = 4000) => emit('info',    message, duration),
}
