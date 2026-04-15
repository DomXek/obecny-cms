import { createServiceClient } from '@/lib/supabase/server'
import { OfficialNotice } from '@/lib/supabase/types'

/** Zapíše riadok do audit_logs */
export async function writeAuditLog(params: {
  tenantId: string
  userId: string | null
  action: string
  entityType: string
  entityId: string
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown>
  ipAddress?: string
}) {
  const supabase = await createServiceClient()
  await supabase.from('audit_logs').insert({
    tenant_id: params.tenantId,
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    old_data: params.oldData ?? null,
    new_data: params.newData ?? null,
    ip_address: params.ipAddress ?? null,
  })
}

/** Vypočíta expires_at = published_at + 15 dní */
export function calcExpiresAt(publishedAt: Date): Date {
  const d = new Date(publishedAt)
  d.setDate(d.getDate() + 15)
  return d
}

/** Vráti true ak oznámenie môže byť zvesenené (expires_at prešiel) */
export function canArchive(notice: OfficialNotice): boolean {
  if (!notice.expires_at) return false
  return new Date(notice.expires_at) <= new Date()
}
