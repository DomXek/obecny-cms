import { FooterConfig, SocialPlatform } from '@/lib/types'
import Link from 'next/link'

const SOCIAL_ICONS: Record<SocialPlatform, string> = {
  facebook:  'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  instagram: 'M16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6zm4 14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8zm-8-8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm5-7a1 1 0 1 1-2 0 1 1 0 0 1 2 0z',
  youtube:   'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z',
  twitter:   'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
  linkedin:  'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
}

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d={SOCIAL_ICONS[platform]} />
    </svg>
  )
}

function currentYear() {
  return new Date().getFullYear()
}

export default function FooterRenderer({ footer }: { footer: FooterConfig }) {
  const year = currentYear()
  const copyright = footer.copyright || `© ${year} ${footer.siteName}. Všetky práva vyhradené.`

  if (footer.style === 'minimal') {
    return (
      <footer
        className="py-4 text-center text-xs border-t"
        style={{ borderColor: 'var(--c-primary)', color: 'var(--c-text)', opacity: 0.5 }}
      >
        {copyright}
      </footer>
    )
  }

  if (footer.style === 'simple') {
    return (
      <footer
        className="border-t"
        style={{ borderColor: 'rgba(0,0,0,0.08)', background: 'var(--c-bg)' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold" style={{ color: 'var(--c-primary)' }}>
            {footer.siteName}
          </span>
          <div className="flex flex-wrap gap-4 justify-center">
            {footer.columns.flatMap(col => col.links).map((link, i) => (
              <Link key={i} href={link.href} className="text-xs hover:opacity-80 transition-opacity"
                style={{ color: 'var(--c-text)', opacity: 0.6 }}>
                {link.label}
              </Link>
            ))}
          </div>
          <span className="text-xs" style={{ color: 'var(--c-text)', opacity: 0.4 }}>{copyright}</span>
        </div>
      </footer>
    )
  }

  // ── columns (default) ──────────────────────────────────────────────────────
  return (
    <footer style={{ background: 'var(--c-primary)', color: '#fff' }}>
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Municipality info — always first */}
          <div className="lg:col-span-1">
            <div className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {footer.siteName}
            </div>
            {footer.tagline && (
              <p className="text-sm mb-4 opacity-70">{footer.tagline}</p>
            )}
            {(footer.address || footer.phone || footer.email || footer.ico) && (
              <div className="space-y-1.5 text-xs opacity-75">
                {footer.address && (
                  <div className="flex gap-2">
                    <span>📍</span>
                    <span>{footer.address}</span>
                  </div>
                )}
                {footer.phone && (
                  <div className="flex gap-2">
                    <span>📞</span>
                    <a href={`tel:${footer.phone}`} className="hover:opacity-90">{footer.phone}</a>
                  </div>
                )}
                {footer.email && (
                  <div className="flex gap-2">
                    <span>✉️</span>
                    <a href={`mailto:${footer.email}`} className="hover:opacity-90">{footer.email}</a>
                  </div>
                )}
                {footer.ico && (
                  <div className="flex gap-2">
                    <span>🏷</span>
                    <span>IČO: {footer.ico}</span>
                  </div>
                )}
              </div>
            )}
            {/* Social links */}
            {footer.socialLinks.length > 0 && (
              <div className="flex gap-2 mt-5">
                {footer.socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                    title={s.platform}
                  >
                    <SocialIcon platform={s.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {footer.columns.map(col => (
            <div key={col.id}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 opacity-50">
                {col.heading}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm opacity-75 hover:opacity-100 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-40"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
          <span>{copyright}</span>
          <span>Powered by Obecný CMS</span>
        </div>
      </div>
    </footer>
  )
}
