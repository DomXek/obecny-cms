import Link from 'next/link'

interface Breadcrumb {
  label: string
  href?: string
}

interface Props {
  title: string
  breadcrumbs?: Breadcrumb[]
}

export default function PageHeader({ title, breadcrumbs }: Props) {
  return (
    <section
      className="flex flex-col items-center justify-center text-center px-6 py-12"
      style={{ background: 'linear-gradient(135deg, var(--c-secondary), var(--c-primary))' }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs text-white/60 mb-3">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              {b.href
                ? <Link href={b.href} className="hover:text-white transition-colors">{b.label}</Link>
                : <span>{b.label}</span>
              }
            </span>
          ))}
        </nav>
      )}
      <h1
        className="text-3xl md:text-4xl font-bold text-white"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h1>
    </section>
  )
}
