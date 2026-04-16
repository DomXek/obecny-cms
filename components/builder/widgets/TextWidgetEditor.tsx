'use client'

import { useRef, useEffect } from 'react'
import {
  Bold, Italic, Heading2, Heading3, List, Link2, Check,
} from 'lucide-react'

interface Props {
  html: string
  onChange: (html: string) => void
  onDone: () => void
}

export default function TextWidgetEditor({ html, onChange, onDone }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    el.innerHTML = html || ''
    // focus at end
    const range = document.createRange()
    const sel = window.getSelection()
    range.selectNodeContents(el)
    range.collapse(false)
    sel?.removeAllRanges()
    sel?.addRange(range)
    el.focus()
  }, [])

  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    save()
  }

  function save() {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { save(); onDone() }
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); exec('bold') }
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') { e.preventDefault(); exec('italic') }
  }

  function insertHeading(tag: 'h2' | 'h3') {
    exec('formatBlock', tag)
  }

  function insertLink() {
    const url = prompt('URL odkazu:')
    if (url) exec('createLink', url)
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-white rounded-xl border-2 border-blue-400 shadow-xl overflow-hidden">
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200 shrink-0"
        onMouseDown={e => e.preventDefault()} // prevent blur when clicking toolbar
      >
        <ToolBtn onClick={() => insertHeading('h2')} title="Nadpis H2">
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => insertHeading('h3')} title="Nadpis H3">
          <Heading3 size={14} />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('bold')} title="Tučné (⌘B)">
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Kurzíva (⌘I)">
          <Italic size={14} />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Zoznam">
          <List size={14} />
        </ToolBtn>
        <ToolBtn onClick={insertLink} title="Odkaz">
          <Link2 size={14} />
        </ToolBtn>
        <div className="flex-1" />
        <button
          onClick={() => { save(); onDone() }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Check size={12} /> Hotovo
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={save}
        onKeyDown={handleKeyDown}
        className="flex-1 overflow-auto p-5 outline-none prose prose-sm max-w-none text-gray-800 focus:outline-none"
        data-placeholder="Začni písať..."
        style={{ minHeight: 80 }}
      />
    </div>
  )
}

function ToolBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-gray-300 mx-1" />
}
