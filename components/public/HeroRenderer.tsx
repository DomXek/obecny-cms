import { HeroConfig } from '@/lib/types'

export default function HeroRenderer({ hero }: { hero: HeroConfig }) {
  let bg: React.CSSProperties

  if (hero.bgColor) {
    bg = { background: hero.bgColor }
  } else if (hero.bgFrom && hero.bgTo) {
    bg = { background: `linear-gradient(135deg, ${hero.bgFrom}, ${hero.bgTo})` }
  } else {
    bg = { background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }
  }

  return (
    <section
      style={{ ...bg, minHeight: `${hero.height}px` }}
      className="flex items-center justify-center px-6"
    >
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p className="text-lg md:text-xl text-white/80">
            {hero.subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
