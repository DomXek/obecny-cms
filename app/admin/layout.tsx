import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import { getSiteType, getEnabledPlugins } from '@/lib/siteConfig'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [siteType, enabledPlugins] = await Promise.all([
    getSiteType(),
    getEnabledPlugins(),
  ])

  if (!siteType) {
    redirect('/onboarding')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <AdminNav siteType={siteType} enabledPlugins={enabledPlugins} />
      <div className="flex-1 overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  )
}
