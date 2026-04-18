import { HeroConfig } from '@/lib/types'

export default function HeroRenderer({ hero }: { hero: HeroConfig }) {
  const overlay = hero.bgOverlay ?? 40

  const bgStyle: React.CSSProperties = hero.bgImage
    ? {
        backgroundImage: `url(${hero.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        background: 'linear-gradient(135deg, var(--c-secondary), var(--c-primary))',
      }

  return (
    <section
      style={{ ...bgStyle, minHeight: `${hero.height}px` }}
      className="relative flex items-center justify-center px-6"
    >
      {/* Dark overlay when photo is used */}
      {hero.bgImage && (
        <div
          className="absolute inset-0"
          style={{ background: `rgba(0,0,0,${overlay / 100})` }}
        />
      )}

      <div className="relative z-10 text-center max-w-3xl">
        <h1
          className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
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
