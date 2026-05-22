import type { Metadata } from 'next'
import { FindingsListView } from '@/modules/findings/views/findings-list-view'

export const metadata: Metadata = { title: 'Hallazgos' }

export default function FindingsPage() {
  return <FindingsListView />
}
