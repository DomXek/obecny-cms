'use client'

import { useState } from 'react'

interface Props {
  tenantId?: string | null
}

export default function ContactWidget({ tenantId }: Props) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [phone, setPhone]     = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantId) return
    setSending(true)
    setError('')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, name, email, phone, message }),
    })
    if (res.ok) {
      setSent(true)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Chyba pri odosielaní')
    }
    setSending(false)
  }

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl mb-3">✉️</div>
        <p className="font-semibold" style={{ color: 'var(--c-primary)' }}>Správa odoslaná!</p>
        <p className="text-sm opacity-70 mt-1">Čoskoro sa vám ozveme.</p>
      </div>
    )
  }

  const inputClass = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-transparent"

  return (
    <form onSubmit={submit} className="space-y-4">
      <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>Kontaktujte nás</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium opacity-70 block mb-1">Meno *</label>
          <input
            type="text" required value={name} onChange={e => setName(e.target.value)}
            className={inputClass}
            style={{ borderColor: 'var(--c-border, #e5e7eb)' }}
          />
        </div>
        <div>
          <label className="text-xs font-medium opacity-70 block mb-1">E-mail *</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className={inputClass}
            style={{ borderColor: 'var(--c-border, #e5e7eb)' }}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium opacity-70 block mb-1">Telefón</label>
        <input
          type="tel" value={phone} onChange={e => setPhone(e.target.value)}
          className={inputClass}
          style={{ borderColor: 'var(--c-border, #e5e7eb)' }}
        />
      </div>
      <div>
        <label className="text-xs font-medium opacity-70 block mb-1">Správa *</label>
        <textarea
          required rows={4} value={message} onChange={e => setMessage(e.target.value)}
          className={`${inputClass} resize-none`}
          style={{ borderColor: 'var(--c-border, #e5e7eb)' }}
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <button
        type="submit" disabled={sending}
        className="w-full py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-50 transition-colors"
        style={{ background: 'var(--c-primary)', borderRadius: 'var(--radius)' }}
      >
        {sending ? 'Odosielam…' : 'Odoslať správu'}
      </button>
    </form>
  )
}
