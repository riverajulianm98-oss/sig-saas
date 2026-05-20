'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// next-themes v0.4 types omit children under React 19; cast to silence the error
const Provider = NextThemesProvider as React.ComponentType<
  React.ComponentProps<typeof NextThemesProvider> & { children?: React.ReactNode }
>

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </Provider>
  )
}
