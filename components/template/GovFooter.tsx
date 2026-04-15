interface Props {
  municipalityName: string
  contactEmail?: string | null
  contactPhone?: string | null
  address?: string | null
}

export default function GovFooter({ municipalityName, contactEmail, contactPhone, address }: Props) {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-4">
            {municipalityName}
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Oficiálna webová stránka obce
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-4">
            Kontakt
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            {address && <li>{address}</li>}
            {contactPhone && <li><a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">{contactPhone}</a></li>}
            {contactEmail && <li><a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a></li>}
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-4">
            Dôležité odkazy
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/uradna-tabula" className="hover:text-white transition-colors">Úradná tabuľa</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-gray-600">
          <span>© {new Date().getFullYear()} {municipalityName}</span>
          <span>Powered by Obecný CMS</span>
        </div>
      </div>
    </footer>
  )
}
