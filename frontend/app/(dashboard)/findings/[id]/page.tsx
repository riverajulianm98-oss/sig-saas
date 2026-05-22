import type { Metadata } from 'next'
import { FindingDetailView } from '@/modules/findings/views/finding-detail-view'

export const metadata: Metadata = { title: 'Detalle de Hallazgo' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function FindingDetailPage({ params }: Props) {
  const { id } = await params
  return <FindingDetailView id={id} />
}
