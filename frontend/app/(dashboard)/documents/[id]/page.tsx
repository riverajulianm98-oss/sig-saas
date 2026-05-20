import type { Metadata } from 'next'
import { DocumentDetailView } from '@/modules/documents/views/document-detail-view'

export const metadata: Metadata = { title: 'Documento' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function DocumentDetailPage({ params }: Props) {
  const { id } = await params
  return <DocumentDetailView documentId={id} />
}
