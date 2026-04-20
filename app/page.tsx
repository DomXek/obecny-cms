import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_TYPES } from '@/lib/plugins'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Nav */}
      <header className="flex items-center justify-between px-8 h-16 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-sm">🏛</div>
          <span className="font-semibold tracking-tight">Obecný CMS</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">
            Prihlásiť sa
          </Link>
          <Link
            href="/vytvorit"
            className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
          >
            Začať zadarmo
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-24">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-white/30 mb-8 border border-white/10 px-4 py-2 rounded-full">
          Page builder pre každý typ webu
        </div>

        <h1 className="text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mb-6">
          Profesionálny web.<br />
          <span className="text-white/30">Bez kompromisov.</span>
        </h1>

        <p className="text-white/50 text-lg max-w-xl leading-relaxed mb-12">
          Vytvorte web pre obec, školu alebo firmu za pár minút.
          Plnohodnotný CMS s page builderom, aktualitami a modulmi na mieru.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/vytvorit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors"
          >
            Vytvoriť stránku
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="text-sm text-white/40 hover:text-white transition-colors px-4 py-3.5"
          >
            Mám už účet
          </Link>
        </div>
      </section>

      {/* Site types */}
      <section className="px-8 pb-24 max-w-5xl mx-auto w-full">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/20 text-center mb-10">
          Pre koho je to určené
        </p>
        <div className="grid grid-cols-4 gap-4">
          {SITE_TYPES.map(st => (
            <div
              key={st.id}
              className="border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-colors"
            >
              <div className="text-3xl mb-4">{st.icon}</div>
              <div className="font-semibold text-sm mb-2">{st.label}</div>
              <div className="text-white/30 text-xs leading-relaxed">{st.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5 px-8 py-24 max-w-5xl mx-auto w-full">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/20 text-center mb-16">
          Ako to funguje
        </p>
        <div className="grid grid-cols-3 gap-12">
          {[
            { num: '01', title: 'Zaregistrujte sa', desc: 'Zadajte názov stránky, zvoľte slug a vytvorte účet. Trvá to menej ako minútu.' },
            { num: '02', title: 'Zvoľte typ a moduly', desc: 'Vyberte typ webu a aktivujte len tie moduly, ktoré skutočne potrebujete.' },
            { num: '03', title: 'Budujte a publikujte', desc: 'Používajte drag & drop page builder, píšte aktuality a spravujte obsah.' },
          ].map(step => (
            <div key={step.num}>
              <div className="text-4xl font-bold text-white/8 mb-4">{step.num}</div>
              <div className="font-semibold text-sm mb-2">{step.title}</div>
              <div className="text-white/30 text-xs leading-relaxed">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="border-t border-white/5 px-8 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Pripravení začať?</h2>
        <p className="text-white/40 text-sm mb-8">Vytvorte si stránku ešte dnes. Zadarmo.</p>
        <Link
          href="/vytvorit"
          className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3.5 rounded-xl text-sm hover:bg-white/90 transition-colors"
        >
          Vytvoriť stránku
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-6 flex items-center justify-between text-white/20 text-xs">
        <span>© 2026 Obecný CMS</span>
        <span>Powered by HOSUOBU</span>
      </footer>

    </div>
  )
}
