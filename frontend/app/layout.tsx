import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'SIGCYA — Integrated Management Platform', template: '%s · SIGCYA' },
  description: 'Plataforma enterprise de Sistemas Integrados de Gestión — ISO 9001 · 14001 · 45001 · HSEQ para PYMES latinoamericanas.',
  keywords: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'HSEQ', 'SIG', 'auditorías', 'compliance', 'CAPA'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
