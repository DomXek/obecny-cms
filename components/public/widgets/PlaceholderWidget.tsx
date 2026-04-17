const LABELS: Record<string, string> = {
  notices: '📋 Úradná tabuľa',
  events:  '📅 Kalendár akcií',
  gallery: '🖼 Galéria',
  contact: '✉️ Kontakt',
  map:     '🗺 Mapa',
}

export default function PlaceholderWidget({ type }: { type: string }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <span className="text-sm text-gray-400">{LABELS[type] ?? type}</span>
    </div>
  )
}
