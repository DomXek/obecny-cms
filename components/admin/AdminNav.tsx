'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutTemplate, FileText, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  {
    href: '/admin/wireframe',
    icon: LayoutTemplate,
    label: 'Wireframe',
    match: (p: string) => p.startsWith('/admin/wireframe'),
  },
  {
    href: '/admin/stranky',
    icon: FileText,
    label: 'Stránky',
    match: (p: string) => p.startsWith('/admin/stranky'),
  },
  {
    href: '/admin/nastavenia',
    icon: Settings,
    label: 'Nastavenia',
    match: (p: string) => p.startsWith('/admin/nastavenia'),
  },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="w-14 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-3 shrink-0 h-full">
      {/* Logo */}
      <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-base mb-4 shrink-0">
        🏛
      </div>

      <div className="w-6 h-px bg-gray-800 mb-2 shrink-0" />

      {/* Nav items */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {NAV.map(({ href, icon: Icon, label, match }) => {
          const active = match(pathname)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`group relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-gray-500 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={17} />
              {/* Tooltip */}
              <span className="absolute left-12 bg-gray-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                {label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        title="Odhlásiť sa"
        className="group relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-gray-800 transition-all shrink-0"
      >
        <LogOut size={16} />
        <span className="absolute left-12 bg-gray-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
          Odhlásiť sa
        </span>
      </button>
    </nav>
  )
}
