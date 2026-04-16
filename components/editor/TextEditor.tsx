'use client'

import { useRef, useEffect } from 'react'
import { X, Bold, Italic, Heading2, Heading3, List } from 'lucide-react'

interface Props {
  html: string
  onChange: (html: string) => void
  onClose: () => void
}

export default function TextEditor({ html, onChange, onClose }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const initialHtml = useRef(html)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    el.innerHTML = initialHtml.current || ''
    el.focus()
    const range = document.createRange()
    const sel = window.getSelection()
    range.selectNodeContents(el)
    range.collapse(false)
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [])

  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    save()
  }

  function save() {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { save(); onClose() }
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); exec('bold') }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') { e.preventDefault(); exec('italic') }
  }

  return (
    <div className="absolute inset-0 z-50 bg-white rounded-xl border-2 border-blue-400 shadow-2xl flex flex-col overflow-hidden">
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
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors font-bold text-xs">
          <Bold size={14} />
        </button>
        <button onMouseDown={e => { e.preventDefault(); exec('italic') }}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors italic text-xs">
          <Italic size={14} />
        </button>
        <button onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList') }}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors">
          <List size={14} />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => { save(); onClose() }}
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
        onInput={save}
        onKeyDown={handleKeyDown}
        className="flex-1 p-5 outline-none overflow-y-auto prose prose-sm max-w-none text-gray-800 [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-semibold [&>p]:text-sm [&>p]:leading-relaxed"
      />
    </div>
  )
}
