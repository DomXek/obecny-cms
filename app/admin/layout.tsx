import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <AdminNav />
      <div className="flex-1 overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  )
}
