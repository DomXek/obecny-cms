import { getMyTenantId } from '@/lib/tenant'
import { loadFooterConfig } from '@/lib/loadFooter'
import FooterEditor from './FooterEditor'

export const dynamic = 'force-dynamic'

export default async function FooterPage() {
  const tenantId = await getMyTenantId()
  const footer = await loadFooterConfig(tenantId)
  return <FooterEditor initial={footer} />
}
