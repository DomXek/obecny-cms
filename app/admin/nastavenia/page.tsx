import { Settings } from 'lucide-react'

export default function NastaveniaPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-950 text-white">
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-6 shrink-0">
        <Settings size={16} className="text-gray-400 mr-2" />
        <span className="text-sm font-semibold">Nastavenia</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings size={28} className="text-gray-600" />
          </div>
          <p className="text-gray-500 text-sm">Nastavenia webu — čoskoro</p>
        </div>
      </div>
    </div>
  )
}
