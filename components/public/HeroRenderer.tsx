import { HeroConfig } from '@/lib/types'

export default function HeroRenderer({ hero }: { hero: HeroConfig }) {
  // Always driven by site style — colors come from CSS vars set in Design → Štýl
  const bg: React.CSSProperties = {
    background: 'linear-gradient(135deg, var(--c-secondary), var(--c-primary))',
  }

  return (
    <section style={{ ...bg, minHeight: `${hero.height}px` }} className="flex items-center justify-center px-6">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}>
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p className="text-lg md:text-xl text-white/80" style={{ fontFamily: 'var(--font-body)' }}>
            {hero.subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
