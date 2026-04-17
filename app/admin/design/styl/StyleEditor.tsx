'use client'

import { useState, useEffect } from 'react'
import { Save, Check, Paintbrush, RefreshCw } from 'lucide-react'
import {
  SiteStyle, RadiusPreset, ShadowPreset, NavEffect,
  DEFAULT_STYLE, HEADING_FONTS, BODY_FONTS, COLOR_PRESETS,
  RADIUS_MAP, buildCssVars, buildFontUrl,
} from '@/lib/siteStyle'

// ── Live preview ──────────────────────────────────────────────────────────────
function Preview({ style }: { style: SiteStyle }) {
  const cssVars = buildCssVars(style)
  const fontUrl = buildFontUrl(style)
  const r = RADIUS_MAP[style.radius]

  return (
    <div className="sticky top-6">
      {/* Font loader */}
      <link rel="stylesheet" href={fontUrl} />

      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <div className="px-3 py-2 bg-gray-900 border-b border-gray-700 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-gray-500 flex-1 text-center">náhľad</span>
        </div>

        <div style={{ '--preview-vars': cssVars } as React.CSSProperties}>
          <style>{`:root { ${cssVars} }`}</style>

          {/* Nav */}
          <div style={{
            background: style.navEffect === 'glass' ? style.colorNavBg + 'ee' : style.colorNavBg,
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: `'${style.fontBody}', sans-serif`,
          }}>
            <div style={{
              width: 24, height: 24,
              background: style.colorPrimary,
              borderRadius: r,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12,
            }}>🏛</div>
            <span style={{ fontWeight: 600, fontSize: 12, color: style.colorText, fontFamily: `'${style.fontHeading}', sans-serif` }}>
              Obec Vzorová
            </span>
            <div style={{ flex: 1, display: 'flex', gap: 8, justifyContent: 'center' }}>
              {['Domov', 'Aktuality', 'Kontakt'].map(l => (
                <span key={l} style={{ fontSize: 11, color: style.colorText + 'aa', cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>

          {/* Hero */}
          <div style={{
            background: `linear-gradient(135deg, ${style.colorSecondary}, ${style.colorPrimary})`,
            padding: '24px 16px',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 6px',
              fontFamily: `'${style.fontHeading}', sans-serif`,
            }}>Vitajte v obci</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0, fontFamily: `'${style.fontBody}', sans-serif` }}>
              Oficiálna webová stránka obce
            </p>
          </div>

          {/* Cards */}
          <div style={{ background: style.colorBg, padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['Aktuality', 'Úradná tabuľa'].map(t => (
              <div key={t} style={{
                background: '#fff',
                borderRadius: r,
                padding: '10px 12px',
                boxShadow: style.shadow !== 'none' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                border: '1px solid rgba(0,0,0,0.06)',
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: style.colorPrimary,
                  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
                  fontFamily: `'${style.fontHeading}', sans-serif`,
                }}>{t}</div>
                <div style={{ fontSize: 11, color: style.colorText + '99', fontFamily: `'${style.fontBody}', sans-serif` }}>
                  Príklad položky zoznamu
                </div>
              </div>
            ))}
          </div>

          {/* Button sample */}
          <div style={{ background: style.colorBg, padding: '0 12px 12px', display: 'flex', gap: 8 }}>
            <div style={{
              background: style.colorPrimary, color: '#fff',
              padding: '6px 14px', borderRadius: r, fontSize: 11, fontWeight: 600,
              fontFamily: `'${style.fontBody}', sans-serif`,
            }}>Primárne</div>
            <div style={{
              background: style.colorAccent, color: '#fff',
              padding: '6px 14px', borderRadius: r, fontSize: 11, fontWeight: 600,
              fontFamily: `'${style.fontBody}', sans-serif`,
            }}>Akcentové</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Color swatch picker ───────────────────────────────────────────────────────
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg cursor-pointer border-2 border-gray-700 group-hover:border-gray-500 transition-colors p-0.5 bg-transparent"
      />
      <div>
        <div className="text-sm text-white">{label}</div>
        <div className="text-xs text-gray-500 font-mono">{value}</div>
      </div>
    </label>
  )
}

// ── Font selector ─────────────────────────────────────────────────────────────
function FontSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-600 transition-colors"
      >
        {options.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StyleEditor({ initialStyle }: { initialStyle: SiteStyle }) {
  const [style, setStyle] = useState<SiteStyle>(initialStyle)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  function set<K extends keyof SiteStyle>(key: K, val: SiteStyle[K]) {
    setStyle(s => ({ ...s, [key]: val }))
  }

  async function save() {
    setSaving(true)
    await fetch('/api/settings/style', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(style),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function reset() {
    if (confirm('Obnoviť predvolený štýl?')) setStyle(DEFAULT_STYLE)
  }

  const RADIUS_OPTIONS: { id: RadiusPreset; label: string; desc: string }[] = [
    { id: 'none', label: 'Hranaté',      desc: '0px' },
    { id: 'sm',   label: 'Jemné',        desc: '4px' },
    { id: 'md',   label: 'Štandardné',   desc: '8px' },
    { id: 'lg',   label: 'Okrúhle',      desc: '16px' },
    { id: 'xl',   label: 'Veľmi okrúhle', desc: '24px' },
  ]

  const SHADOW_OPTIONS: { id: ShadowPreset; label: string }[] = [
    { id: 'none',     label: 'Žiadny' },
    { id: 'subtle',   label: 'Jemný' },
    { id: 'moderate', label: 'Stredný' },
    { id: 'strong',   label: 'Výrazný' },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <Paintbrush size={16} className="text-gray-400" />
          <span className="text-sm font-semibold">Štýl webu</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-colors" title="Obnoviť predvolené">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={save}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50'
            }`}
          >
            {saved ? <><Check size={14} />Uložené</> : <><Save size={14} />{saving ? 'Ukladám…' : 'Uložiť'}</>}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 overflow-hidden flex">

        {/* Left — controls */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 min-w-0">

          {/* ── Color presets ────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Farebné predvoľby</h2>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setStyle(s => ({ ...s, colorPrimary: p.primary, colorSecondary: p.secondary, colorAccent: p.accent }))}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors border border-gray-700 hover:border-gray-600"
                >
                  <span className="flex gap-1">
                    <span className="w-3 h-3 rounded-full" style={{ background: p.primary }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: p.secondary }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: p.accent }} />
                  </span>
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          {/* ── Custom colors ────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Farby</h2>
            <div className="grid grid-cols-2 gap-4">
              <ColorField label="Primárna"   value={style.colorPrimary}   onChange={v => set('colorPrimary', v)} />
              <ColorField label="Sekundárna" value={style.colorSecondary} onChange={v => set('colorSecondary', v)} />
              <ColorField label="Akcentová"  value={style.colorAccent}    onChange={v => set('colorAccent', v)} />
              <ColorField label="Pozadie"    value={style.colorBg}        onChange={v => set('colorBg', v)} />
              <ColorField label="Text"       value={style.colorText}      onChange={v => set('colorText', v)} />
              <ColorField label="Nav pozadie" value={style.colorNavBg}   onChange={v => set('colorNavBg', v)} />
            </div>
          </section>

          {/* ── Fonts ────────────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Fonty</h2>
            <div className="grid grid-cols-2 gap-4">
              <FontSelect label="Nadpisy" value={style.fontHeading} options={HEADING_FONTS} onChange={v => set('fontHeading', v)} />
              <FontSelect label="Text"    value={style.fontBody}    options={BODY_FONTS}    onChange={v => set('fontBody', v)} />
            </div>
            <div
              className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-800 text-center"
              style={{ fontFamily: `'${style.fontHeading}', sans-serif` }}
            >
              <link rel="stylesheet" href={buildFontUrl(style)} />
              <span className="text-white text-base font-semibold">Aa — {style.fontHeading}</span>
              <span className="text-gray-500 text-sm ml-3" style={{ fontFamily: `'${style.fontBody}', sans-serif` }}>
                Aa — {style.fontBody}
              </span>
            </div>
          </section>

          {/* ── Border radius ─────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Zaoblenie rohov</h2>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map(o => (
                <button
                  key={o.id}
                  onClick={() => set('radius', o.id)}
                  className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border text-xs transition-colors ${
                    style.radius === o.id
                      ? 'border-blue-600 bg-blue-950/30 text-white'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {/* Shape preview */}
                  <div
                    className="w-8 h-8 bg-blue-500/40 border-2 border-blue-400"
                    style={{ borderRadius: RADIUS_MAP[o.id] }}
                  />
                  <span className="font-medium">{o.label}</span>
                  <span className="text-gray-600">{o.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Shadows ──────────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Tiene</h2>
            <div className="flex gap-2">
              {SHADOW_OPTIONS.map(o => (
                <button
                  key={o.id}
                  onClick={() => set('shadow', o.id)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm transition-colors ${
                    style.shadow === o.id
                      ? 'border-blue-600 bg-blue-950/30 text-white'
                      : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div
                    className="w-8 h-5 bg-white rounded mx-auto mb-2"
                    style={{
                      boxShadow: o.id === 'none' ? 'none'
                        : o.id === 'subtle'   ? '0 2px 6px rgba(0,0,0,0.2)'
                        : o.id === 'moderate' ? '0 4px 12px rgba(0,0,0,0.3)'
                        : '0 8px 20px rgba(0,0,0,0.4)',
                    }}
                  />
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          {/* ── Nav effect ────────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Efekt navigácie</h2>
            <div className="flex gap-3">
              {([['solid', 'Pevné pozadie', 'Plná nepriehľadná farba'], ['glass', 'Glassmorphism', 'Priehľadnosť + blur efekt']] as const).map(
                ([id, label, desc]) => (
                  <button
                    key={id}
                    onClick={() => set('navEffect', id)}
                    className={`flex-1 text-left p-4 rounded-xl border transition-colors ${
                      style.navEffect === id
                        ? 'border-blue-600 bg-blue-950/30'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    {/* Mini nav preview */}
                    <div
                      className="rounded-lg border border-gray-200 p-2 mb-3 flex items-center gap-2"
                      style={{
                        background: id === 'glass' ? style.colorNavBg + 'cc' : style.colorNavBg,
                        backdropFilter: id === 'glass' ? 'blur(8px)' : 'none',
                      }}
                    >
                      <div className="w-4 h-4 rounded bg-blue-500 flex-shrink-0" />
                      <div className="flex gap-1.5">
                        <div className="w-8 h-1.5 bg-gray-200 rounded" />
                        <div className="w-8 h-1.5 bg-gray-200 rounded" />
                        <div className="w-8 h-1.5 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="text-sm font-medium text-white">{label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                  </button>
                )
              )}
            </div>
          </section>

        </div>

        {/* Right — live preview */}
        <div className="w-80 shrink-0 border-l border-gray-800 overflow-y-auto p-6 bg-gray-900/40">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Živý náhľad</h2>
          <Preview style={style} />
        </div>

      </div>
    </div>
  )
}
