'use client'

import { useState } from 'react'
import { Save, Check, Plus, Trash2, GripVertical } from 'lucide-react'
import {
  FooterConfig, FooterColumn, FooterLink, FooterSocialLink,
  FooterStyle, SocialPlatform, DEFAULT_FOOTER, uid,
} from '@/lib/types'

// ── Social SVG icons ──────────────────────────────────────────────────────────
function SvgIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d={path} />
    </svg>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STYLES: { id: FooterStyle; label: string; desc: string; preview: React.ReactNode }[] = [
  {
    id: 'columns',
    label: 'Stĺpce',
    desc: 'Plnohodnotný footer s kontaktom, odkazmi a sociálnymi sieťami',
    preview: (
      <div className="bg-blue-700 rounded-lg p-3 text-white text-[9px]">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div><div className="font-bold mb-1">Obec</div><div className="opacity-60">📍 Adresa<br />📞 Tel.</div></div>
          <div><div className="font-bold mb-1 opacity-50 uppercase tracking-wider">Odkazy</div><div className="opacity-70 space-y-0.5"><div>Domov</div><div>Aktuality</div></div></div>
          <div><div className="font-bold mb-1 opacity-50 uppercase tracking-wider">Info</div><div className="opacity-70 space-y-0.5"><div>O obci</div><div>Kontakt</div></div></div>
        </div>
        <div className="border-t border-white/20 pt-1.5 opacity-40 text-center">© 2025 Obec</div>
      </div>
    ),
  },
  {
    id: 'simple',
    label: 'Jednoduchý',
    desc: 'Jeden riadok s logom, odkazmi a autorským právom',
    preview: (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-[9px] flex items-center justify-between">
        <span className="font-bold text-blue-600">Obec</span>
        <div className="flex gap-2 opacity-60">
          {['Domov', 'Aktuality', 'Kontakt'].map(l => <span key={l}>{l}</span>)}
        </div>
        <span className="opacity-40">© 2025</span>
      </div>
    ),
  },
  {
    id: 'minimal',
    label: 'Minimálny',
    desc: 'Iba autorský riadok — pre jednoduché stránky',
    preview: (
      <div className="border-t border-gray-200 pt-2 text-center text-[9px] text-gray-400">
        © 2025 Obec. Všetky práva vyhradené.
      </div>
    ),
  },
]

const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; path: string; placeholder: string }[] = [
  { id: 'facebook',  label: 'Facebook',  path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', placeholder: 'https://facebook.com/obec' },
  { id: 'instagram', label: 'Instagram', path: 'M16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6zm0 2a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h8zm-4 3a5 5 0 1 0 0 10A5 5 0 0 0 12 7zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm5.5-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0z', placeholder: 'https://instagram.com/obec' },
  { id: 'youtube',   label: 'YouTube',   path: 'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z', placeholder: 'https://youtube.com/@obec' },
  { id: 'twitter',   label: 'Twitter/X', path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z', placeholder: 'https://twitter.com/obec' },
  { id: 'linkedin',  label: 'LinkedIn',  path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z', placeholder: 'https://linkedin.com/company/obec' },
]

// ── Component ──────────────────────────────────────────────────────────────────

export default function FooterEditor({ initial }: { initial: FooterConfig }) {
  const [footer, setFooter] = useState<FooterConfig>(initial)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  function set<K extends keyof FooterConfig>(key: K, value: FooterConfig[K]) {
    setFooter(f => ({ ...f, [key]: value }))
  }

  // ── Columns ──────────────────────────────────────────────────────────────────

  function addColumn() {
    const col: FooterColumn = { id: uid(), heading: 'Nový stĺpec', links: [] }
    set('columns', [...footer.columns, col])
  }

  function removeColumn(id: string) {
    set('columns', footer.columns.filter(c => c.id !== id))
  }

  function updateColumn(id: string, patch: Partial<Omit<FooterColumn, 'id'>>) {
    set('columns', footer.columns.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  function addLink(colId: string) {
    const link: FooterLink = { label: 'Odkaz', href: '/' }
    set('columns', footer.columns.map(c =>
      c.id === colId ? { ...c, links: [...c.links, link] } : c
    ))
  }

  function removeLink(colId: string, idx: number) {
    set('columns', footer.columns.map(c =>
      c.id === colId ? { ...c, links: c.links.filter((_, i) => i !== idx) } : c
    ))
  }

  function updateLink(colId: string, idx: number, patch: Partial<FooterLink>) {
    set('columns', footer.columns.map(c =>
      c.id === colId
        ? { ...c, links: c.links.map((l, i) => i === idx ? { ...l, ...patch } : l) }
        : c
    ))
  }

  // ── Social links ──────────────────────────────────────────────────────────────

  function getSocialUrl(platform: SocialPlatform) {
    return footer.socialLinks.find(s => s.platform === platform)?.url ?? ''
  }

  function setSocialUrl(platform: SocialPlatform, url: string) {
    const existing = footer.socialLinks.filter(s => s.platform !== platform)
    const next: FooterSocialLink[] = url ? [...existing, { platform, url }] : existing
    set('socialLinks', next)
  }

  // ── Save ─────────────────────────────────────────────────────────────────────

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/settings/footer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footer),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-white overflow-auto">

      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <span className="text-sm font-semibold">Footer</span>
        <button
          onClick={save}
          disabled={saving}
          className={`flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
            saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {saved ? <><Check size={14} /> Uložené</> : <><Save size={14} /> {saving ? 'Ukladám…' : 'Uložiť'}</>}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8 max-w-3xl">

        {/* ── Style selector ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Štýl footera</h2>
          <div className="grid grid-cols-3 gap-3">
            {STYLES.map(s => (
              <button
                key={s.id}
                onClick={() => set('style', s.id)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  footer.style === s.id
                    ? 'border-blue-500 bg-blue-600/10'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <div className="mb-3">{s.preview}</div>
                <div className="text-xs font-semibold mb-0.5">{s.label}</div>
                <div className="text-[10px] text-gray-500 leading-relaxed">{s.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Basic info ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Základné informácie</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
            {[
              { key: 'siteName' as const,  label: 'Názov obce / mesta',  placeholder: 'Obec Vzorová' },
              { key: 'tagline' as const,   label: 'Tagline / motto',     placeholder: 'Oficiálna webstránka obce' },
              { key: 'address' as const,   label: 'Adresa',              placeholder: 'Hlavná 1, 123 45 Vzorová' },
              { key: 'phone' as const,     label: 'Telefón',             placeholder: '+421 900 000 000' },
              { key: 'email' as const,     label: 'E-mail',              placeholder: 'info@vzorova.sk' },
              { key: 'ico' as const,       label: 'IČO',                 placeholder: '00123456' },
              { key: 'copyright' as const, label: 'Copyright text',      placeholder: `© ${new Date().getFullYear()} Obec Vzorová. Všetky práva vyhradené.` },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="flex items-center gap-4 px-4 py-3">
                <label className="text-xs text-gray-500 w-40 shrink-0">{label}</label>
                <input
                  type="text"
                  value={(footer[key] as string) ?? ''}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Link columns ─────────────────────────────────────────────────── */}
        {(footer.style === 'columns' || footer.style === 'simple') && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stĺpce s odkazmi</h2>
              {footer.columns.length < 3 && (
                <button
                  onClick={addColumn}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Plus size={12} /> Pridať stĺpec
                </button>
              )}
            </div>

            <div className="space-y-4">
              {footer.columns.map(col => (
                <div key={col.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  {/* Column header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                    <GripVertical size={13} className="text-gray-600 shrink-0" />
                    <input
                      type="text"
                      value={col.heading}
                      onChange={e => updateColumn(col.id, { heading: e.target.value })}
                      className="flex-1 bg-transparent text-sm font-medium text-white outline-none"
                      placeholder="Nadpis stĺpca"
                    />
                    <button
                      onClick={() => removeColumn(col.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Links */}
                  <div className="divide-y divide-gray-800">
                    {col.links.map((link, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                        <input
                          type="text"
                          value={link.label}
                          onChange={e => updateLink(col.id, i, { label: e.target.value })}
                          className="w-32 bg-transparent text-xs text-white outline-none"
                          placeholder="Popis"
                        />
                        <span className="text-gray-700 text-xs">→</span>
                        <input
                          type="text"
                          value={link.href}
                          onChange={e => updateLink(col.id, i, { href: e.target.value })}
                          className="flex-1 bg-transparent text-xs text-gray-400 outline-none font-mono"
                          placeholder="/stranka"
                        />
                        <button
                          onClick={() => removeLink(col.id, i)}
                          className="text-gray-700 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addLink(col.id)}
                    className="w-full px-4 py-2 text-xs text-gray-500 hover:text-blue-400 hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={11} /> Pridať odkaz
                  </button>
                </div>
              ))}

              {footer.columns.length === 0 && (
                <div className="text-center py-8 bg-gray-900 border border-gray-800 border-dashed rounded-xl">
                  <p className="text-gray-600 text-xs mb-3">Žiadne stĺpce</p>
                  <button onClick={addColumn} className="text-xs text-blue-400 hover:text-blue-300">
                    <Plus size={11} className="inline mr-1" />Pridať prvý stĺpec
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Social links ─────────────────────────────────────────────────── */}
        {footer.style === 'columns' && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sociálne siete</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
              {SOCIAL_PLATFORMS.map(({ id, label, path, placeholder }) => (
                <div key={id} className="flex items-center gap-4 px-4 py-3">
                  <span className="text-gray-500 shrink-0"><SvgIcon path={path} /></span>
                  <label className="text-xs text-gray-500 w-24 shrink-0">{label}</label>
                  <input
                    type="url"
                    value={getSocialUrl(id)}
                    onChange={e => setSocialUrl(id, e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-xs text-white placeholder-gray-700 outline-none font-mono"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">Prázdne polia sa nezobrazia vo footeri.</p>
          </section>
        )}

      </div>
    </div>
  )
}
