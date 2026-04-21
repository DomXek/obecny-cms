'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import type { SeoConfig } from '@/lib/types'

interface Props {
  seo: SeoConfig
  pageTitle: string
  onChange: (seo: SeoConfig) => void
}

export default function SeoEditor({ seo, pageTitle, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const title = seo.metaTitle || pageTitle
  const desc = seo.metaDescription || ''

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search size={14} className="text-gray-400" />
          <span>SEO nastavenia</span>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* Google preview */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs">
            <div className="text-blue-700 font-medium truncate">{title}</div>
            <div className="text-green-700 text-[11px] mt-0.5">obecny-cms.vercel.app/...</div>
            <div className="text-gray-600 mt-1 line-clamp-2">{desc || 'Bez popisu — odporúčame vyplniť meta description.'}</div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Meta title <span className="text-gray-400 font-normal">({(seo.metaTitle ?? '').length}/60)</span>
            </label>
            <input
              type="text"
              value={seo.metaTitle ?? ''}
              onChange={e => onChange({ ...seo, metaTitle: e.target.value })}
              placeholder={pageTitle}
              maxLength={60}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Meta description <span className="text-gray-400 font-normal">({(seo.metaDescription ?? '').length}/160)</span>
            </label>
            <textarea
              value={seo.metaDescription ?? ''}
              onChange={e => onChange({ ...seo, metaDescription: e.target.value })}
              placeholder="Krátky popis stránky pre vyhľadávače..."
              maxLength={160}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}
