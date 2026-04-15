import Link from 'next/link'

interface NavItem {
  title: string
  slug: string
}

interface Props {
  municipalityName: string
  nav: NavItem[]
  currentSlug?: string
}

export default function GovHeader({ municipalityName, nav, currentSlug }: Props) {
  return (
    <header>
      {/* Top strip */}
      <div className="bg-[#154a8a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Municipal seal placeholder */}
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {municipalityName.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-sm tracking-wide">{municipalityName}</div>
              <div className="text-xs text-blue-200">Oficiálna webová stránka obce</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs text-blue-200">
            <span>Slovenská republika</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex items-center gap-1 overflow-x-auto">
            {nav.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className={`px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  currentSlug === item.slug
                    ? 'border-[#154a8a] text-[#154a8a]'
                    : 'border-transparent text-gray-600 hover:text-[#154a8a] hover:border-[#154a8a]/30'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
