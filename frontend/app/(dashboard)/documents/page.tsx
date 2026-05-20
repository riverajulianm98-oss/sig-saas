import type { Metadata } from 'next'
import { DocumentsListView } from '@/modules/documents/views/documents-list-view'

export const metadata: Metadata = { title: 'Documentos' }

export default function DocumentsPage() {
  return <DocumentsListView />
}
