'use client'

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div
        className="max-w-2xl mx-auto flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border"
        style={{
          background: 'var(--c-surface, #ffffff)',
          borderColor: 'var(--c-border, #e5e7eb)',
          color: 'var(--c-text, #111827)',
        }}
      >
        <Cookie size={20} className="shrink-0 opacity-60" />
        <p className="flex-1 text-sm">
          Táto stránka používa cookies na zlepšenie vašej skúsenosti.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-3 py-1.5 text-xs rounded-lg border transition-colors"
            style={{ borderColor: 'var(--c-border, #e5e7eb)' }}
          >
            Odmietnuť
          </button>
          <button
            onClick={accept}
            className="px-3 py-1.5 text-xs rounded-lg font-medium text-white transition-colors"
            style={{ background: 'var(--c-primary, #2563eb)' }}
          >
            Súhlasím
          </button>
          <button onClick={decline} className="opacity-40 hover:opacity-70">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
