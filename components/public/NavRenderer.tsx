import Link from 'next/link'
import { NavConfig } from '@/lib/types'

interface Props {
  nav: NavConfig
  siteName: string
}

export default function NavRenderer({ nav, siteName }: Props) {
  const justifyMap = {
    left:   'justify-start',
    center: 'justify-center',
    right:  'justify-end',
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6">
        {/* Logo / site name */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            🏛
          </div>
          <span className="font-semibold text-gray-900 text-sm">{siteName}</span>
        </Link>

        {/* Nav items */}
        <nav className={`flex-1 flex items-center gap-1 ${justifyMap[nav.position]}`}>
          {nav.items.map(item => (
            <Link
              key={item.slug}
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
