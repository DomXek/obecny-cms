'use client'

import { useState, useRef, useEffect } from 'react'
import { Settings, X, GripHorizontal } from 'lucide-react'
import { HeroConfig } from '@/lib/types'


interface Props {
  hero: HeroConfig
  onChange: (h: HeroConfig) => void
}

export default function HeroEditor({ hero, onChange }: Props) {
  const [showSettings, setShowSettings] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep contenteditable in sync when hero changes externally
  useEffect(() => {
    if (titleRef.current && titleRef.current.textContent !== hero.title) {
      titleRef.current.textContent = hero.title
    }
    if (subtitleRef.current && subtitleRef.current.textContent !== hero.subtitle) {
      subtitleRef.current.textContent = hero.subtitle
    }
  }, [hero.title, hero.subtitle])

  // ── Drag bottom edge to resize height ─────────────────────────────────────
  function startHeightResize(e: React.MouseEvent) {
    e.preventDefault()
    const startY = e.clientY
    const startH = hero.height

    function onMove(ev: MouseEvent) {
      const newH = Math.max(160, Math.min(800, startH + (ev.clientY - startY)))
      onChange({ ...hero, height: Math.round(newH / 10) * 10 })
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Admin preview uses a fixed gradient — real colors come from Design → Štýl
  const bgStyle = { background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }

  return (
    <div ref={containerRef} className="group/hero relative rounded-2xl overflow-visible shadow-sm mb-1">
      {/* ── Hero visual ──────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl flex flex-col items-center justify-center text-center px-10 relative overflow-hidden transition-all"
        style={{ minHeight: hero.height, ...bgStyle }}
      >
        {/* Overlay tint while hovered */}
        <div className="absolute inset-0 bg-black/0 group-hover/hero:bg-black/10 transition-colors pointer-events-none rounded-2xl" />

        {/* Editable title */}
        <h1
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={e => onChange({ ...hero, title: e.currentTarget.textContent ?? '' })}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); subtitleRef.current?.focus() } }}
          className="text-4xl font-bold text-white mb-2 outline-none cursor-text relative z-10
            hover:bg-white/10 focus:bg-white/10 px-3 py-1 rounded-xl transition-colors
            empty:before:content-['Nadpis_hero'] empty:before:opacity-40"
          spellCheck={false}
        />

        {/* Editable subtitle */}
        <p
          ref={subtitleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={e => onChange({ ...hero, subtitle: e.currentTarget.textContent ?? '' })}
          className="text-blue-100 text-lg outline-none cursor-text relative z-10
            hover:bg-white/10 focus:bg-white/10 px-3 py-1 rounded-xl transition-colors
            empty:before:content-['Podnadpis'] empty:before:opacity-40"
          spellCheck={false}
        />

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(v => !v)}
          className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white opacity-0 group-hover/hero:opacity-100 transition-all z-20"
          title="Nastavenia hero sekcie"
        >
          <Settings size={15} />
        </button>

        {/* Height label */}
        <div className="absolute bottom-8 right-3 text-xs text-white/40 opacity-0 group-hover/hero:opacity-100 transition-opacity select-none">
          {hero.height}px
        </div>
      </div>

      {/* ── Bottom resize handle ─────────────────────────────────────────── */}
      <div
        onMouseDown={startHeightResize}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 cursor-ns-resize
          opacity-0 group-hover/hero:opacity-100 transition-opacity flex flex-col items-center gap-0.5"
        title="Ťahaj pre zmenu výšky"
      >
        <div className="w-10 h-1.5 bg-blue-400 rounded-full shadow" />
        <GripHorizontal size={12} className="text-blue-400" />
      </div>

      {/* ── Settings panel ───────────────────────────────────────────────── */}
      {showSettings && (
        <div className="absolute top-3 right-14 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-72">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-800">Nastavenia Hero</span>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
              <X size={14} />
            </button>
          </div>

          {/* Height */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-600">Výška</label>
              <span className="text-xs text-gray-400 font-mono">{hero.height}px</span>
            </div>
            <input
              type="range"
              min={160}
              max={800}
              step={10}
              value={hero.height}
              onChange={e => onChange({ ...hero, height: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-0.5">
              <span>160</span><span>800</span>
            </div>
          </div>

          {/* Color info */}
          <div className="mt-1 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-600 leading-relaxed">
            Farby hero sekcie sa riadia nastaveniami v{' '}
            <strong>Design → Štýl</strong>{' '}
            (primárna a sekundárna farba).
          </div>
        </div>
      )}
    </div>
  )
}
