import { getMyTenantId } from '@/lib/tenant'
import { loadSiteStyle } from '@/lib/loadStyle'
import StyleEditor from './StyleEditor'

export const dynamic = 'force-dynamic'

export default async function StylPage() {
  const tenantId = await getMyTenantId()
  const style = await loadSiteStyle(tenantId)
  return <StyleEditor initialStyle={style} />
}
