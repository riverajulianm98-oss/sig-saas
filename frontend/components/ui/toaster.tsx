'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react'
import { subscribeToasts, type ToastItem } from '@/lib/toast'
import { cn } from '@/lib/utils'

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}

const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  error:   'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  info:    'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
}

const ICON_STYLES = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
}

function Toast({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const Icon = ICONS[item.type]

  useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), item.duration)
    return () => clearTimeout(t)
  }, [item, onRemove])

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-black/5 max-w-sm w-full',
        'animate-slide-up',
        STYLES[item.type]
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', ICON_STYLES[item.type])} />
      <p className="text-sm font-medium flex-1 leading-snug">{item.message}</p>
      <button
        onClick={() => onRemove(item.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    return subscribeToasts((item) => {
      setToasts((prev) => [...prev, item])
    })
  }, [])

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast item={t} onRemove={remove} />
        </div>
      ))}
    </div>
  )
}
