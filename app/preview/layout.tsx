import { redirect } from 'next/navigation'
import { getMyTenantId } from '@/lib/tenant'
import { loadSiteStyle } from '@/lib/loadStyle'
import { loadFooterConfig } from '@/lib/loadFooter'
import { createServiceClient } from '@/lib/supabase/service'
import { PageLayout } from '@/lib/types'
import StyleInjector from '@/components/public/StyleInjector'
import NavRenderer from '@/components/public/NavRenderer'
import FooterRenderer from '@/components/public/FooterRenderer'
import CookieBanner from '@/components/public/CookieBanner'

export const dynamic = 'force-dynamic'

export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  const tenantId = await getMyTenantId()
  if (!tenantId) redirect('/login')

  const supabase = createServiceClient()
  const [{ data: homePage }, style, footer] = await Promise.all([
    supabase.from('pages').select('layout, title').eq('slug', 'domov').eq('tenant_id', tenantId).single(),
    loadSiteStyle(tenantId),
    loadFooterConfig(tenantId),
  ])

  const layout = homePage?.layout as PageLayout | undefined
  const nav = layout?.nav ?? { style: 'simple' as const, position: 'center' as const, items: [] }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--c-bg)', color: 'var(--c-text)', fontFamily: 'var(--font-body)' }}>
      <StyleInjector style={style} />
      {/* Preview banner */}
      <div className="bg-blue-600 text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-4">
        <span>Náhľad webu — návštevníci toto nevidia</span>
        <a href="/admin/dashboard" className="underline hover:no-underline">← Späť do adminu</a>
      </div>
      <NavRenderer nav={nav} siteName={homePage?.title ?? 'Web'} />
      <main className="flex-1">{children}</main>
      <FooterRenderer footer={footer} />
      <CookieBanner />
    </div>
  )
}
