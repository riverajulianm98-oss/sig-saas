const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION ?? 'v1'

export const config = {
  apiUrl,
  apiVersion,
  apiBase: `${apiUrl}/api/${apiVersion}`,
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  /** When true, 404/network errors on unimplemented routes fall back to mock data */
  useMockFallback: process.env.NEXT_PUBLIC_USE_MOCK_FALLBACK !== 'false',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'SIGCYA',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
}
