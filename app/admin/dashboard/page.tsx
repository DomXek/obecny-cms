import { createServiceClient } from '@/lib/supabase/service'
import { getMyTenantId } from '@/lib/tenant'
import { Aktualita } from '@/lib/types'
import { LayoutDashboard, ExternalLink, FileText, Eye, EyeOff, Plus, Layout, Palette, Menu, ChevronRight } from 'lucide-react'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function DashboardPage() {
  const tenantId = await getMyTenantId()
  const supabase = createServiceClient()

  const [{ count: totalCount }, { count: publishedCount }, { data: recent }] = await Promise.all([
    supabase.from('aktuality').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('aktuality').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('is_published', true),
    supabase
      .from('aktuality')
      .select('id, title, slug, is_published, published_at, created_at')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const total = totalCount ?? 0
  const published = publishedCount ?? 0
  const drafts = total - published
  const recentItems = (recent ?? []) as Pick<Aktualita, 'id' | 'title' | 'slug' | 'is_published' | 'published_at' | 'created_at'>[]

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-white overflow-auto">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={16} className="text-gray-400" />
          <span className="text-sm font-semibold">Dashboard</span>
        </div>
        <a
          href="/preview"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          <ExternalLink size={13} />
          Zobraziť web
        </a>
      </div>

      <div className="flex-1 p-6 space-y-6 max-w-4xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-3">
              <FileText size={13} />
              Celkovo aktualít
            </div>
            <div className="text-3xl font-bold">{total}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-green-400 text-xs font-medium mb-3">
              <Eye size={13} />
              Publikované
            </div>
            <div className="text-3xl font-bold text-green-400">{published}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-medium mb-3">
              <EyeOff size={13} />
              Koncepty
            </div>
            <div className="text-3xl font-bold text-yellow-400">{drafts}</div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rýchle akcie</h2>
          <div className="grid grid-cols-4 gap-3">
            <Link
              href="/admin/prispevky/aktuality/nova"
              className="flex flex-col items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 rounded-xl p-4 text-center transition-colors group"
            >
              <div className="w-9 h-9 bg-blue-600/20 group-hover:bg-blue-600/30 rounded-lg flex items-center justify-center transition-colors">
                <Plus size={16} className="text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-300">Nová aktualita</span>
            </Link>
            <Link
              href="/admin/design/wireframe"
              className="flex flex-col items-center gap-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 rounded-xl p-4 text-center transition-colors group"
            >
              <div className="w-9 h-9 bg-purple-600/20 group-hover:bg-purple-600/30 rounded-lg flex items-center justify-center transition-colors">
                <Layout size={16} className="text-purple-400" />
              </div>
              <span className="text-xs font-medium text-purple-300">Wireframe</span>
            </Link>
            <Link
              href="/admin/design/styl"
              className="flex flex-col items-center gap-2 bg-pink-600/10 hover:bg-pink-600/20 border border-pink-600/30 rounded-xl p-4 text-center transition-colors group"
            >
              <div className="w-9 h-9 bg-pink-600/20 group-hover:bg-pink-600/30 rounded-lg flex items-center justify-center transition-colors">
                <Palette size={16} className="text-pink-400" />
              </div>
              <span className="text-xs font-medium text-pink-300">Štýl</span>
            </Link>
            <Link
              href="/admin/design/menu"
              className="flex flex-col items-center gap-2 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-600/30 rounded-xl p-4 text-center transition-colors group"
            >
              <div className="w-9 h-9 bg-orange-600/20 group-hover:bg-orange-600/30 rounded-lg flex items-center justify-center transition-colors">
                <Menu size={16} className="text-orange-400" />
              </div>
              <span className="text-xs font-medium text-orange-300">Menu</span>
            </Link>
          </div>
        </div>

        {/* Recent articles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Posledné aktuality</h2>
            <Link
              href="/admin/prispevky/aktuality"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              Všetky <ChevronRight size={11} />
            </Link>
          </div>

          {recentItems.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm">Zatiaľ žiadne aktuality.</p>
              <Link
                href="/admin/prispevky/aktuality/nova"
                className="inline-flex items-center gap-2 mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus size={13} /> Vytvoriť prvú aktualitu
              </Link>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {recentItems.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/admin/prispevky/aktuality/${item.id}`}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-800 transition-colors group ${i !== recentItems.length - 1 ? 'border-b border-gray-800' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.is_published ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-white transition-colors">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.is_published
                        ? `Publikované · ${formatDate(item.published_at ?? item.created_at)}`
                        : `Koncept · ${formatDate(item.created_at)}`}
                    </p>
                  </div>
                  <ChevronRight size={13} className="text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Site status */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Stav webu</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0 shadow-[0_0_6px_theme(colors.green.400)]" />
            <div>
              <p className="text-sm font-medium">Web je aktívny</p>
              <p className="text-xs text-gray-500 mt-0.5">Verejná stránka je dostupná pre návštevníkov</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Otvoriť <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
