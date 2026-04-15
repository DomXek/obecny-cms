export type NoticeStatus = 'draft' | 'published' | 'archived'
export type UserRole = 'superadmin' | 'admin' | 'editor'

export interface Tenant {
  id: string
  name: string
  slug: string
  custom_domain: string | null
  logo_url: string | null
  primary_color: string
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  ico: string | null
  is_active: boolean
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  tenant_id: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OfficialNotice {
  id: string
  tenant_id: string
  title: string
  content: string | null
  document_url: string | null
  document_filename: string | null
  category: string | null
  reference_number: string | null
  published_at: string | null
  expires_at: string | null
  removed_at: string | null
  status: NoticeStatus
  created_by: string | null
  published_by: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  tenant_id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}
