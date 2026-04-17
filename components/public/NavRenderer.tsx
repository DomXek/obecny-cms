import Link from 'next/link'
import { NavConfig, NavItem } from '@/lib/types'
import { ChevronDown } from 'lucide-react'

interface Props {
  nav: NavConfig
  siteName: string
}

const justifyMap = {
  left:   'justify-start',
  center: 'justify-center',
  right:  'justify-end',
}

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo({ name }: { name: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">🏛</div>
      <span className="font-semibold text-gray-900 text-sm">{name}</span>
    </Link>
  )
}

// ── Style 1: Simple ───────────────────────────────────────────────────────────
function SimpleNav({ nav, siteName }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        <Logo name={siteName} />
        <nav className={`flex-1 flex items-center gap-1 ${justifyMap[nav.position]}`}>
          {nav.items.map(item => (
            <Link
              key={item.id ?? item.slug}
              href={`/${item.slug}`}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

// ── Style 2: Dropdown (2 levels) ──────────────────────────────────────────────
function DropdownItem({ item }: { item: NavItem }) {
  const hasChildren = (item.children?.length ?? 0) > 0
  if (!hasChildren) {
    return (
      <Link
        href={`/${item.slug}`}
        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {item.label}
      </Link>
    )
  }
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        {item.label}
        <ChevronDown size={13} className="transition-transform group-hover:rotate-180" />
      </button>
      {/* Dropdown panel */}
      <div className="absolute top-full left-0 mt-1 min-w-44 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-150 translate-y-1 group-hover:translate-y-0 z-50">
        {item.children!.map(child => (
          <Link
            key={child.id ?? child.slug}
            href={`/${child.slug}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function DropdownNav({ nav, siteName }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        <Logo name={siteName} />
        <nav className={`flex-1 flex items-center gap-1 ${justifyMap[nav.position]}`}>
          {nav.items.map(item => (
            <DropdownItem key={item.id ?? item.slug} item={item} />
          ))}
        </nav>
      </div>
    </header>
  )
}

// ── Style 3: Mega menu (3 levels) ─────────────────────────────────────────────
function MegaItem({ item }: { item: NavItem }) {
  const hasColumns = (item.children?.length ?? 0) > 0
  if (!hasColumns) {
    return (
      <Link
        href={`/${item.slug}`}
        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {item.label}
      </Link>
    )
  }
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        {item.label}
        <ChevronDown size={13} className="transition-transform group-hover:rotate-180" />
      </button>
      {/* Mega panel — full width below header */}
      <div className="fixed left-0 right-0 mt-1 bg-white border-b border-gray-100 shadow-xl
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-150 translate-y-1 group-hover:translate-y-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-6 grid gap-8"
          style={{ gridTemplateColumns: `repeat(${item.children!.length}, minmax(0, 1fr))` }}>
          {item.children!.map(col => (
            <div key={col.id ?? col.slug}>
              {/* Column heading — links to its own slug */}
              <Link
                href={`/${col.slug}`}
                className="text-xs font-semibold text-gray-900 uppercase tracking-wide hover:text-blue-600 transition-colors mb-2 block"
              >
                {col.label}
              </Link>
              {/* Level 3 items */}
              {(col.children ?? []).map(sub => (
                <Link
                  key={sub.id ?? sub.slug}
                  href={`/${sub.slug}`}
                  className="block py-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MegaNav({ nav, siteName }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        <Logo name={siteName} />
        <nav className={`flex-1 flex items-center gap-1 ${justifyMap[nav.position]}`}>
          {nav.items.map(item => (
            <MegaItem key={item.id ?? item.slug} item={item} />
          ))}
        </nav>
      </div>
    </header>
  )
}

// ── Router ────────────────────────────────────────────────────────────────────
export default function NavRenderer({ nav, siteName }: Props) {
  switch (nav.style ?? 'simple') {
    case 'dropdown': return <DropdownNav nav={nav} siteName={siteName} />
    case 'mega':     return <MegaNav     nav={nav} siteName={siteName} />
    default:         return <SimpleNav   nav={nav} siteName={siteName} />
  }
}
