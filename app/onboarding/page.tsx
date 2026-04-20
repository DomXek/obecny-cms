'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SITE_TYPES, PLUGINS, type SiteType, getCompatiblePlugins, getDefaultEnabledPlugins } from '@/lib/plugins'
import { Check, ChevronRight, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react'

type Step = 'type' | 'plugins'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('type')
  const [selectedType, setSelectedType] = useState<SiteType | null>(null)
  const [enabledPlugins, setEnabledPlugins] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function selectType(type: SiteType) {
    setSelectedType(type)
    setEnabledPlugins(new Set(getDefaultEnabledPlugins(type)))
  }

  function togglePlugin(id: string) {
    const plugin = PLUGINS.find(p => p.id === id)
    if (plugin?.core) return
    setEnabledPlugins(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function finish() {
    if (!selectedType) return
    setError('')
    setSaving(true)
    const res = await fetch('/api/admin/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteType: selectedType, enabledPlugins: [...enabledPlugins] }),
    })
    if (res.ok) {
      router.push('/admin/dashboard')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? `Chyba ${res.status}`)
      setSaving(false)
    }
  }

  const compatiblePlugins = selectedType ? getCompatiblePlugins(selectedType) : []
  const optionalPlugins = compatiblePlugins.filter(p => !p.core)
  const corePlugins = compatiblePlugins.filter(p => p.core)

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-5">
            <span className="text-white text-2xl">🏛</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Vitajte v Obecný CMS</h1>
          <p className="text-gray-500 text-sm">
            {step === 'type'
              ? 'Najprv nám povedzte, aký typ webu budete stavať.'
              : 'Vyberte si moduly, ktoré chcete používať.'}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {(['type', 'plugins'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 text-sm ${step === s ? 'text-white' : step === 'plugins' && s === 'type' ? 'text-gray-500' : 'text-gray-700'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s ? 'bg-blue-600 text-white' :
                  (step === 'plugins' && s === 'type') ? 'bg-gray-700 text-gray-400' : 'bg-gray-800 text-gray-600'
                }`}>
                  {step === 'plugins' && s === 'type' ? <Check size={12} /> : i + 1}
                </div>
                <span>{s === 'type' ? 'Typ webu' : 'Moduly'}</span>
              </div>
              {i === 0 && <div className="w-8 h-px bg-gray-800" />}
            </div>
          ))}
        </div>

        {/* Step 1 — výber typu */}
        {step === 'type' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {SITE_TYPES.map(st => (
                <button
                  key={st.id}
                  onClick={() => selectType(st.id)}
                  className={`relative text-left p-6 rounded-2xl border transition-all ${
                    selectedType === st.id
                      ? 'border-blue-500 bg-blue-950/30'
                      : 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-900/80'
                  }`}
                >
                  {selectedType === st.id && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                  <div className="text-3xl mb-3">{st.icon}</div>
                  <div className="text-white font-semibold text-base mb-1">{st.label}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{st.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep('plugins')}
                disabled={!selectedType}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Pokračovať
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* Step 2 — výber pluginov */}
        {step === 'plugins' && selectedType && (
          <>
            <div className="space-y-6">
              {/* Core plugins */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1">
                  Základné moduly — vždy aktívne
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {corePlugins.map(p => (
                    <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-900 border border-gray-800 opacity-60">
                      <span className="text-2xl">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium">{p.label}</div>
                        <div className="text-gray-500 text-xs mt-0.5 truncate">{p.description}</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                        <Check size={13} className="text-blue-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional plugins */}
              {optionalPlugins.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1">
                    Voliteľné moduly
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {optionalPlugins.map(p => {
                      const enabled = enabledPlugins.has(p.id)
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePlugin(p.id)}
                          className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                            enabled
                              ? 'bg-blue-950/20 border-blue-800'
                              : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <span className="text-2xl">{p.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${enabled ? 'text-white' : 'text-gray-400'}`}>{p.label}</div>
                            <div className="text-gray-500 text-xs mt-0.5 truncate">{p.description}</div>
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
            </div>

            <p className="text-center text-gray-600 text-xs mt-6">
              Moduly môžete kedykoľvek zmeniť v Nastavenia → Pluginy
            </p>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-900/20 rounded-lg py-2 px-3 mt-4">{error}</p>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setStep('type')}
                className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors"
              >
                <ArrowLeft size={15} />
                Späť
              </button>
              <button
                onClick={finish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {saving ? 'Ukladám...' : 'Spustiť CMS'}
                {!saving && <ChevronRight size={16} />}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
