import { redirect } from 'next/navigation'
import { getMyTenantId } from '@/lib/tenant'
import { createServiceClient } from '@/lib/supabase/service'
import { PageLayout } from '@/lib/types'
import HeroRenderer from '@/components/public/HeroRenderer'
import GridRenderer from '@/components/public/GridRenderer'

export const dynamic = 'force-dynamic'

export default async function PreviewHomePage() {
  const tenantId = await getMyTenantId()
  if (!tenantId) redirect('/login')

  const supabase = createServiceClient()
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'domov')
    .eq('tenant_id', tenantId)
    .single()

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <p className="text-gray-400 text-lg mb-2">Domovská stránka ešte neexistuje.</p>
        <a href="/admin/design/wireframe" className="text-blue-400 hover:underline text-sm">
          Vytvoriť ju vo Wireframe editore →
        </a>
      </div>
    )
  }

  const layout = page.layout as PageLayout

  return (
    <>
      <HeroRenderer hero={layout.hero} />
      <GridRenderer rows={(layout as any).rows ?? []} tenantId={tenantId} basePath="/preview" />
    </>
  )
}
