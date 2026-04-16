'use client'

import { useDraggable } from '@dnd-kit/core'
import { WIDGET_DEFS, WidgetType } from '@/lib/types'

function WidgetCard({ type }: { type: WidgetType }) {
  const def = WIDGET_DEFS[type]
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: { from: 'sidebar', widgetType: type },
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-grab active:cursor-grabbing bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 transition-all select-none ${isDragging ? 'opacity-50' : ''}`}
    >
      <span className="text-xl">{def.icon}</span>
      <div className="min-w-0">
        <div className="text-sm font-medium text-white">{def.label}</div>
        <div className="text-xs text-gray-500 truncate">{def.description}</div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const types = Object.keys(WIDGET_DEFS) as WidgetType[]

  return (
    <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-800">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Widgety</h2>
        <p className="text-xs text-gray-600 mt-0.5">Pretiahnite na stránku</p>
      </div>

      {/* Widget list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {types.map(type => (
          <WidgetCard key={type} type={type} />
        ))}
      </div>
    </div>
  )
}
