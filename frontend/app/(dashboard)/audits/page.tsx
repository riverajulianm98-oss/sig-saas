import type { Metadata } from 'next'
import { AuditsListView } from '@/modules/audits/views/audits-list-view'

export const metadata: Metadata = { title: 'Auditorías' }

export default function AuditsPage() {
  return <AuditsListView />
}
