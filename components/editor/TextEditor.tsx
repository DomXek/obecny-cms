'use client'

import { useRef, useEffect, useState } from 'react'
import { X, Bold, Italic, Heading2, Heading3, List, Upload, Trash2, ImageIcon } from 'lucide-react'

interface Props {
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
  onClose: () => void
}

export default function TextEditor({ content, onChange, onClose }: Props) {
  const editorRef  = useRef<HTMLDivElement>(null)
  const initialHtml = useRef((content.html as string) ?? '')
  const fileRef    = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const imageUrl      = (content.imageUrl as string)      ?? ''
  const imagePosition = (content.imagePosition as string) ?? 'right'

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    el.innerHTML = initialHtml.current
    el.focus()
    const range = document.createRange()
    const sel   = window.getSelection()
    range.selectNodeContents(el)
    range.collapse(false)
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [])

  function saveHtml() {
    if (editorRef.current) {
      onChange({ ...content, html: editorRef.current.innerHTML })
    }
  }

  function setField(key: string, value: unknown) {
    onChange({ ...content, html: editorRef.current?.innerHTML ?? (content.html as string) ?? '', [key]: value })
  }

  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    saveHtml()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { saveHtml(); onClose() }
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); exec('bold') }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') { e.preventDefault(); exec('italic') }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) setField('imageUrl', json.url)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: text editor ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 shrink-0">
          <button onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'H2') }}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Nadpis H2">
            <Heading2 size={14} />
          </button>
          <button onMouseDown={e => { e.preventDefault(); exec('formatBlock', 'H3') }}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Nadpis H3">
            <Heading3 size={14} />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-0.5" />
          <button onMouseDown={e => { e.preventDefault(); exec('bold') }}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
            <Bold size={14} />
          </button>
          <button onMouseDown={e => { e.preventDefault(); exec('italic') }}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
            <Italic size={14} />
          </button>
          <button onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
            <List size={14} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => { saveHtml(); onClose() }}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition-colors"
          >
            Hotovo
          </button>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-colors ml-0.5">
            <X size={14} />
          </button>
        </div>

        {/* Editable area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={saveHtml}
          onKeyDown={handleKeyDown}
          className="flex-1 p-5 outline-none overflow-y-auto prose prose-sm max-w-none text-gray-800
            [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-semibold
            [&>p]:text-sm [&>p]:leading-relaxed"
        />
      </div>

      {/* ── Right: photo panel ─────────────────────────────────────────────── */}
      <div className="w-56 border-l border-gray-200 bg-gray-50 flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ImageIcon size={13} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-600">Fotka v bloku</span>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          {/* Preview / upload */}
          {imageUrl ? (
            <div className="relative rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="w-full h-28 object-cover" />
              <button
                onClick={() => setField('imageUrl', '')}
                className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded text-white"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ) : (
            <div className="h-28 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400">
              <ImageIcon size={20} className="opacity-40" />
              <span className="text-[10px]">Žiadna fotka</span>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-1.5 text-xs border border-gray-300 hover:border-blue-400 hover:text-blue-600 rounded-lg px-3 py-2 transition-colors bg-white disabled:opacity-50"
          >
            <Upload size={11} />
            {uploading ? 'Nahrávam…' : imageUrl ? 'Zmeniť' : 'Nahrať fotku'}
          </button>

          {/* Position — only when image exists */}
          {imageUrl && (
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Poloha fotky</p>
              <div className="grid grid-cols-2 gap-1.5">
                {([
                  { id: 'right',  label: 'Vpravo', icon: '▶' },
                  { id: 'left',   label: 'Vľavo',  icon: '◀' },
                  { id: 'top',    label: 'Hore',   icon: '▲' },
                  { id: 'bottom', label: 'Dole',   icon: '▼' },
                ] as const).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setField('imagePosition', opt.id)}
                    className={`flex flex-col items-center py-2 rounded-lg border text-[10px] transition-colors ${
                      imagePosition === opt.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm mb-0.5">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
