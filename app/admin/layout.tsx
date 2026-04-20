import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import { getSiteType, getEnabledPlugins } from '@/lib/siteConfig'
import { getMyTenantId } from '@/lib/tenant'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const tenantId = await getMyTenantId()
  if (!tenantId) redirect('/vytvorit')

  const [siteType, enabledPlugins] = await Promise.all([
    getSiteType(tenantId),
    getEnabledPlugins(tenantId),
  ])

  if (!siteType) redirect('/onboarding')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <AdminNav siteType={siteType} enabledPlugins={enabledPlugins} />
      <div className="flex-1 overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  )
}
