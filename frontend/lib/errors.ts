import type { AxiosError } from 'axios'
import { toast } from './toast'

interface ApiError {
  detail?: string | { msg: string }[]
  message?: string
}

export function extractErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (!err) return fallback

  const axErr = err as AxiosError<ApiError>
  const data = axErr.response?.data

  if (data?.detail) {
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) return data.detail.map((d) => d.msg).join(', ')
  }
  if (data?.message) return data.message

  if (axErr.message === 'Network Error') return 'Sin conexión al servidor'
  if (axErr.code === 'ECONNABORTED') return 'La solicitud tardó demasiado'
  if (axErr.response?.status === 403) return 'No tienes permiso para realizar esta acción'
  if (axErr.response?.status === 404) return 'Recurso no encontrado'
  if (axErr.response?.status === 422) return 'Datos inválidos. Revisa los campos requeridos'
  if (axErr.response?.status === 500) return 'Error interno del servidor'

  return fallback
}

export function handleApiError(err: unknown, context?: string): void {
  const msg = extractErrorMessage(err)
  toast.error(context ? `${context}: ${msg}` : msg)
}

export function isNetworkError(err: unknown): boolean {
  const axErr = err as AxiosError
  return axErr.message === 'Network Error' || !axErr.response
}

export function isNotFound(err: unknown): boolean {
  return (err as AxiosError)?.response?.status === 404
}
