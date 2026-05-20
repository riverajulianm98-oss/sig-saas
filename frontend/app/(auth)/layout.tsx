import { Shield } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[hsl(var(--primary))] p-12 text-white">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <span className="text-xl font-semibold">{APP_NAME}</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Gestiona tu Sistema Integrado de Gestión con precisión
          </h1>
          <p className="text-lg text-white/70">
            ISO 9001 · ISO 14001 · ISO 45001 · HSEQ · SST — todo en una sola plataforma
            enterprise diseñada para PYMES latinoamericanas.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-white/60">
          <span>Multi-tenant</span>
          <span>RBAC granular</span>
          <span>Trazabilidad completa</span>
          <span>IA integrada</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2">
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />
          <span className="text-lg font-semibold">{APP_NAME}</span>
        </div>
        {children}
      </div>
    </div>
  )
}
