'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Newspaper, FileCheck, CalendarDays, Image,
  Palette, LayoutTemplate, Menu, Paintbrush,
  Users, UserPlus, ShieldCheck,
  Settings, Sliders,
  LogOut, ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  label: string
  href: string
}

interface NavSection {
  label: string
  icon: React.ElementType
  base: string
  items: NavItem[]
}

const SECTIONS: NavSection[] = [
  {
    label: 'Príspevky',
    icon: Newspaper,
    base: '/admin/prispevky',
    items: [
      { label: 'Aktuality', href: '/admin/prispevky/aktuality' },
      { label: 'Zápis na úrednú desku', href: '/admin/prispevky/uradna-deska' },
      { label: 'Kalendár akcií', href: '/admin/prispevky/kalendar' },
      { label: 'Media / Galéria', href: '/admin/prispevky/media' },
    ],
  },
  {
    label: 'Design',
    icon: Palette,
    base: '/admin/design',
    items: [
      { label: 'Templates', href: '/admin/design/templates' },
      { label: 'Wireframe', href: '/admin/design/wireframe' },
      { label: 'Navigačné menu', href: '/admin/design/menu' },
      { label: 'Footer', href: '/admin/design/footer' },
      { label: 'Štýl', href: '/admin/design/styl' },
    ],
  },
  {
    label: 'Užívateľ a role',
    icon: Users,
    base: '/admin/uzivatelia',
    items: [
      { label: 'Pridať užívateľa', href: '/admin/uzivatelia/pridat' },
      { label: 'Permissions', href: '/admin/uzivatelia/permissions' },
    ],
  },
  {
    label: 'General settings',
    icon: Settings,
    base: '/admin/nastavenia',
    items: [
      { label: 'Hlavné nastavenia', href: '/admin/nastavenia/hlavne' },
    ],
  },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Open the section that contains the current route by default
  const defaultOpen = SECTIONS.reduce<Record<string, boolean>>((acc, s) => {
    acc[s.base] = pathname.startsWith(s.base) ||
      s.items.some(i => pathname === i.href)
    return acc
  }, {})
  const [open, setOpen] = useState<Record<string, boolean>>(defaultOpen)

  function toggle(base: string) {
    setOpen(o => ({ ...o, [base]: !o[base] }))
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="w-56 bg-gray-950 border-r border-gray-800 flex flex-col shrink-0 h-full overflow-y-auto">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 shrink-0 border-b border-gray-800">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-sm shrink-0">🏛</div>
        <span className="text-white text-sm font-semibold truncate">Obecný CMS</span>
      </div>

      {/* Dashboard */}
      <div className="px-3 pt-3">
        <Link
          href="/admin/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/admin/dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Sections */}
      <div className="flex-1 px-3 py-2 space-y-0.5">
        {SECTIONS.map(({ label, icon: Icon, base, items }) => {
          const isOpen = open[base] ?? false
          const sectionActive = pathname.startsWith(base)

          return (
            <div key={base}>
              {/* Section header */}
              <button
                onClick={() => toggle(base)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  sectionActive
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon size={15} className="shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                <ChevronDown
                  size={13}
                  className={`shrink-0 transition-transform text-gray-600 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Sub-items */}
              {isOpen && (
                <div className="ml-3 pl-3 border-l border-gray-800 mt-0.5 space-y-0.5">
                  {items.map(({ label: itemLabel, href }) => {
                    const active = pathname === href
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          active
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-gray-500 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {itemLabel}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Logout */}
      <div className="px-3 pb-3 shrink-0 border-t border-gray-800 pt-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
        >
          <LogOut size={15} />
          <span>Odhlásiť sa</span>
        </button>
      </div>
    </nav>
  )
}
