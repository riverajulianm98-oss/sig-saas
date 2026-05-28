const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION ?? 'v1'

// NEXT_PUBLIC_USE_REAL_API=true  → all routes go to the real FastAPI backend, no mock fallback
// NEXT_PUBLIC_USE_REAL_API=false → 404/503 errors fall back to demo data automatically
const useRealApi = process.env.NEXT_PUBLIC_USE_REAL_API === 'true'

export const config = {
  apiUrl,
  apiVersion,
  apiBase: `${apiUrl}/api/${apiVersion}`,
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  useRealApi,
  /** When true, 404/network errors on unimplemented routes fall back to mock data */
  useMockFallback: useRealApi ? false : (process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== 'false'),
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'SIGCYA',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
}
