'use client'

import { useState, useEffect, useCallback } from 'react'
import { Puzzle, ToggleLeft, ToggleRight, Check, RefreshCw } from 'lucide-react'
import { PLUGINS, SITE_TYPES, getCompatiblePlugins, type SiteType } from '@/lib/plugins'

export default function PluginyPage() {
  const [siteType, setSiteType] = useState<SiteType | null>(null)
  const [enabledPlugins, setEnabledPlugins] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/site-config')
      .then(r => r.json())
      .then(data => {
        setSiteType(data.siteType)
        setEnabledPlugins(new Set(data.enabledPlugins ?? []))
        setLoading(false)
      })
  }, [])

  function toggle(id: string) {
    const plugin = PLUGINS.find(p => p.id === id)
    if (plugin?.core) return
    setEnabledPlugins(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    await fetch('/api/admin/site-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabledPlugins: [...enabledPlugins] }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const compatible = siteType ? getCompatiblePlugins(siteType) : []
  const corePlugins = compatible.filter(p => p.core)
  const optionalPlugins = compatible.filter(p => !p.core)
  const stConfig = SITE_TYPES.find(s => s.id === siteType)

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-white overflow-y-auto">
      {/* Header */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Puzzle size={16} className="text-gray-400" />
          <span className="text-sm font-semibold">Pluginy a moduly</span>
          {stConfig && (
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-800 ${stConfig.accentColor}`}>
              {stConfig.label}
            </span>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          {saved ? (
            <><Check size={13} />Uložené</>
          ) : saving ? (
            <><RefreshCw size={13} className="animate-spin" />Ukladám...</>
          ) : (
            'Uložiť zmeny'
          )}
        </button>
      </div>

      <div className="p-6 max-w-2xl space-y-8">
        {/* Core */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Základné moduly — vždy aktívne
          </div>
          <div className="space-y-2">
            {corePlugins.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-800 opacity-60">
                <span className="text-xl">{p.icon}</span>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{p.label}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{p.description}</div>
                </div>
                <Check size={14} className="text-blue-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Optional */}
        {optionalPlugins.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Voliteľné moduly
            </div>
            <div className="space-y-2">
              {optionalPlugins.map(p => {
                const enabled = enabledPlugins.has(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      enabled
                        ? 'bg-blue-950/20 border-blue-800'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${enabled ? 'text-white' : 'text-gray-400'}`}>{p.label}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{p.description}</div>
                    </div>
                    {enabled
                      ? <ToggleRight size={22} className="text-blue-400 shrink-0" />
                      : <ToggleLeft size={22} className="text-gray-600 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <p className="text-gray-600 text-xs">
          Zmena pluginov neodstráni existujúce dáta — len skryje daný modul z administrácie.
        </p>
      </div>
    </div>
  )
}
