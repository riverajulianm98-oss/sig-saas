import type { Metadata } from 'next'
import { CapaDashboardView } from '@/modules/findings/views/capa-dashboard-view'

export const metadata: Metadata = { title: 'CAPA – Acciones Correctivas' }

export default function CapaPage() {
  return <CapaDashboardView />
}
