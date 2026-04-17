import Link from 'next/link'
import { NavConfig, NavItem } from '@/lib/types'
import { ChevronDown } from 'lucide-react'

interface Props { nav: NavConfig; siteName: string }

const justifyMap = { left: 'justify-start', center: 'justify-center', right: 'justify-end' }

const NAV_STYLE: React.CSSProperties = {
  background: 'var(--c-nav-bg)',
  backdropFilter: 'var(--c-nav-blur)',
  WebkitBackdropFilter: 'var(--c-nav-blur)',
  fontFamily: 'var(--font-body)',
  borderBottom: '1px solid rgba(0,0,0,0.07)',
  boxShadow: 'var(--shadow)',
}

function Logo({ name }: { name: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <div className="w-8 h-8 flex items-center justify-center text-white text-sm font-bold"
        style={{ background: 'var(--c-primary)', borderRadius: 'var(--radius)' }}>
        🏛
      </div>
      <span className="font-semibold text-sm" style={{ color: 'var(--c-text)', fontFamily: 'var(--font-heading)' }}>
        {name}
      </span>
    </Link>
  )
}

const LINK_STYLE: React.CSSProperties = {
  color: 'var(--c-text)',
  fontSize: '0.875rem',
  padding: '6px 12px',
  borderRadius: 'var(--radius-sm)',
  transition: 'background 0.15s, color 0.15s',
}

// ── Simple ────────────────────────────────────────────────────────────────────
function SimpleNav({ nav, siteName }: Props) {
  return (
    <header className="sticky top-0 z-50" style={NAV_STYLE}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        <Logo name={siteName} />
        <nav className={`flex-1 flex items-center gap-1 ${justifyMap[nav.position]}`}>
          {nav.items.map(item => (
            <Link key={item.id ?? item.slug} href={`/${item.slug}`}
              className="hover:bg-black/5 transition-colors" style={LINK_STYLE}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

// ── Dropdown (2 levels) ───────────────────────────────────────────────────────
function DropdownItem({ item }: { item: NavItem }) {
  const hasChildren = (item.children?.length ?? 0) > 0
  if (!hasChildren) {
    return (
      <Link href={`/${item.slug}`} className="hover:bg-black/5 transition-colors" style={LINK_STYLE}>
        {item.label}
      </Link>
    )
  }
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 hover:bg-black/5 transition-colors" style={LINK_STYLE}>
        {item.label}
        <ChevronDown size={13} className="transition-transform group-hover:rotate-180" />
      </button>
      <div className="absolute top-full left-0 mt-1 min-w-44 bg-white rounded-xl border border-black/5 py-1.5
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-150 translate-y-1 group-hover:translate-y-0 z-50"
        style={{ boxShadow: 'var(--shadow)', borderRadius: 'var(--radius)' }}>
        {item.children!.map(child => (
          <Link key={child.id ?? child.slug} href={`/${child.slug}`}
            className="block px-4 py-2 text-sm hover:bg-black/5 transition-colors"
            style={{ color: 'var(--c-text)' }}>
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function DropdownNav({ nav, siteName }: Props) {
  return (
    <header className="sticky top-0 z-50" style={NAV_STYLE}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        <Logo name={siteName} />
        <nav className={`flex-1 flex items-center gap-1 ${justifyMap[nav.position]}`}>
          {nav.items.map(item => <DropdownItem key={item.id ?? item.slug} item={item} />)}
        </nav>
      </div>
    </header>
  )
}

// ── Mega menu (3 levels) ──────────────────────────────────────────────────────
function MegaItem({ item }: { item: NavItem }) {
  const hasColumns = (item.children?.length ?? 0) > 0
  if (!hasColumns) {
    return (
      <Link href={`/${item.slug}`} className="hover:bg-black/5 transition-colors" style={LINK_STYLE}>
        {item.label}
      </Link>
    )
  }
  return (
    <div className="relative group">
      <button className="flex items-center gap-1 hover:bg-black/5 transition-colors" style={LINK_STYLE}>
        {item.label}
        <ChevronDown size={13} className="transition-transform group-hover:rotate-180" />
      </button>
      <div className="fixed left-0 right-0 bg-white border-b border-black/5
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-150 translate-y-1 group-hover:translate-y-0 z-40"
        style={{ boxShadow: 'var(--shadow)', marginTop: '4px' }}>
        <div className="max-w-6xl mx-auto px-6 py-6 grid gap-8"
          style={{ gridTemplateColumns: `repeat(${item.children!.length}, minmax(0,1fr))` }}>
          {item.children!.map(col => (
            <div key={col.id ?? col.slug}>
              <Link href={`/${col.slug}`}
                className="text-xs font-semibold uppercase tracking-wide mb-2 block hover:opacity-70 transition-opacity"
                style={{ color: 'var(--c-primary)' }}>
                {col.label}
              </Link>
              {(col.children ?? []).map(sub => (
                <Link key={sub.id ?? sub.slug} href={`/${sub.slug}`}
                  className="block py-1 text-sm hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--c-text)' }}>
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
    <header className="sticky top-0 z-50" style={NAV_STYLE}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        <Logo name={siteName} />
        <nav className={`flex-1 flex items-center gap-1 ${justifyMap[nav.position]}`}>
          {nav.items.map(item => <MegaItem key={item.id ?? item.slug} item={item} />)}
        </nav>
      </div>
    </header>
  )
}

export default function NavRenderer({ nav, siteName }: Props) {
  switch (nav.style ?? 'simple') {
    case 'dropdown': return <DropdownNav nav={nav} siteName={siteName} />
    case 'mega':     return <MegaNav     nav={nav} siteName={siteName} />
    default:         return <SimpleNav   nav={nav} siteName={siteName} />
  }
}
