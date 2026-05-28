import { AuthGuard } from '@/components/auth/auth-guard'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { HealthBar } from '@/components/system/health-bar'
import { ImpersonationBanner } from '@/modules/admin/components/impersonation-banner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen flex-col overflow-hidden bg-[hsl(var(--background))]">
        <HealthBar />
        <ImpersonationBanner />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
