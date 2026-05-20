import type { Metadata } from 'next'
import { AuditDetailView } from '@/modules/audits/views/audit-detail-view'

export const metadata: Metadata = { title: 'Auditoría' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function AuditDetailPage({ params }: Props) {
  const { id } = await params
  return <AuditDetailView auditId={id} />
}
