'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Check } from 'lucide-react'

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function VytvoritPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleNameChange(val: string) {
    setName(val)
    if (!slugManual) setSlug(toSlug(val))
  }

  function handleSlugChange(val: string) {
    setSlugManual(true)
    setSlug(toSlug(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/vytvorit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Niečo sa pokazilo')
      setLoading(false)
      return
    }

    // Sign in the newly created user
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError('Účet bol vytvorený, ale prihlásenie zlyhalo. Skúste sa prihlásiť manuálne.')
      setLoading(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-5">
            <span className="text-white text-2xl">🏛</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Vytvoriť stránku</h1>
          <p className="text-gray-500 text-sm">Zaregistrujte sa a začnite budovať váš web</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Site name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Názov stránky
            </label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              required
              autoFocus
              placeholder="Obec Dolná Streda"
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Adresa stránky
            </label>
            <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
              <span className="pl-4 pr-1 text-gray-600 text-sm shrink-0">slug:</span>
              <input
                type="text"
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                required
                placeholder="dolna-streda"
                className="flex-1 bg-transparent text-white px-2 py-3 text-sm placeholder-gray-600 focus:outline-none"
              />
            </div>
            <p className="text-gray-600 text-xs mt-1 pl-1">
              Neskôr: <span className="text-gray-500">{slug || 'vas-slug'}.hosuobu.cz</span>
            </p>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Váš účet</p>

            {/* Email */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="jan@novak.sk"
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Heslo</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="min. 6 znakov"
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 text-sm placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900/20 rounded-lg py-2 px-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors mt-2"
          >
            {loading ? 'Vytváram...' : (
              <><ArrowRight size={16} />Vytvoriť stránku</>
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Už máte účet?{' '}
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
            Prihláste sa
          </Link>
        </p>
      </div>
    </div>
  )
}
