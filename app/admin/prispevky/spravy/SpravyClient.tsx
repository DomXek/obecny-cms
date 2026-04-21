'use client'

import { useState } from 'react'
import { Mail, MailOpen, Trash2, Phone } from 'lucide-react'

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  is_read: boolean
  created_at: string
}

export default function SpravyClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [selected, setSelected] = useState<Message | null>(null)

  async function markRead(msg: Message) {
    if (msg.is_read) return
    setMessages(m => m.map(x => x.id === msg.id ? { ...x, is_read: true } : x))
    await fetch(`/api/contact?id=${msg.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true }),
    })
  }

  async function deleteMsg(id: string) {
    setMessages(m => m.filter(x => x.id !== id))
    if (selected?.id === id) setSelected(null)
    await fetch(`/api/contact?id=${id}`, { method: 'DELETE' })
  }

  function open(msg: Message) {
    setSelected(msg)
    markRead(msg)
  }

  const unread = messages.filter(m => !m.is_read).length

  return (
    <div className="flex-1 flex h-full bg-gray-950 text-white overflow-hidden">
      {/* List */}
      <div className="w-80 border-r border-gray-800 flex flex-col shrink-0">
        <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-2">
          <Mail size={16} className="text-gray-400" />
          <span className="text-sm font-semibold">Správy</span>
          {unread > 0 && (
            <span className="ml-auto text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5 font-medium">
              {unread}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-600 text-sm py-16">Žiadne správy</div>
          )}
          {messages.map(msg => (
            <button
              key={msg.id}
              onClick={() => open(msg)}
              className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-900 transition-colors ${
                selected?.id === msg.id ? 'bg-gray-800' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {!msg.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                <span className={`text-sm flex-1 truncate ${!msg.is_read ? 'font-semibold text-white' : 'text-gray-400'}`}>
                  {msg.name}
                </span>
                <span className="text-xs text-gray-600 shrink-0">
                  {new Date(msg.created_at).toLocaleDateString('sk')}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{msg.message}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <div className="max-w-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">{selected.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <a href={`mailto:${selected.email}`} className="text-sm text-blue-400 hover:underline">
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Phone size={12} /> {selected.phone}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(selected.created_at).toLocaleString('sk')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selected.is_read
                  ? <MailOpen size={16} className="text-gray-600" />
                  : <Mail size={16} className="text-blue-400" />}
                <button
                  onClick={() => deleteMsg(selected.id)}
                  className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
            </div>

            <a
              href={`mailto:${selected.email}?subject=Re: Správa z webu`}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Mail size={14} /> Odpovedať e-mailom
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            <div className="text-center">
              <Mail size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Vyberte správu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
