export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Obecný CMS
        </p>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          CMS pre slovenské<br />obce a mestá
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Moderná správa webu. Legislatívne správna úradná tabuľa.<br />
          Jednoduché ako Shopify.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/admin/login"
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Prihlásiť sa do adminu
          </a>
          <a
            href="/uradna-tabula?tenant=demo"
            className="border border-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Ukážková úradná tabuľa
          </a>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-8 text-left border-t pt-10">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Úradná tabuľa</p>
            <p className="text-sm text-gray-500">Legislatívne správna. 15-dňová lehota automaticky. Archív navždy.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Multi-tenant</p>
            <p className="text-sm text-gray-500">Každá obec má vlastnú subdoménu a izolované dáta.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Jednoduché</p>
            <p className="text-sm text-gray-500">Žiadny Docker, žiadna server správa. Vercel + Supabase.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
