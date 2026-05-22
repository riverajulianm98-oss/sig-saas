import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE, TOKEN_KEYS } from './constants'
import { isDemoMode } from './demo-mode'
import { config } from './config'
import { createDemoAdapter, matchDemoData } from './demo-interceptor'
import { toast } from './toast'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Inject full demo adapter when DEMO_MODE is active (intercepts ALL requests)
if (isDemoMode()) {
  const original = apiClient.defaults.adapter as unknown as Parameters<typeof createDemoAdapter>[0]
  apiClient.defaults.adapter = createDemoAdapter(original) as unknown as typeof apiClient.defaults.adapter
}

// ── Request interceptor: attach access token + tenant header ──────────────────
apiClient.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEYS.access)
  const tenantId = localStorage.getItem(TOKEN_KEYS.tenantId)
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  if (tenantId) cfg.headers['X-Tenant-ID'] = tenantId
  return cfg
})

// ── Response interceptor: auto-refresh on 401 + smart mock fallback ───────────
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

// Routes that can fall back to mock data when the backend returns 404/error
const FALLBACK_PATTERNS = [
  /\/findings/,
  /\/capa/,
  /\/analytics/,
  /\/reports\/generate/,
]

function isFallbackEligible(url: string): boolean {
  return FALLBACK_PATTERNS.some((p) => p.test(url))
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _fallback?: boolean }

    // ── Mock fallback for unimplemented backend routes ─────────────────────────
    // Activates in real mode when backend returns 404/503 or is unreachable
    if (
      !isDemoMode() &&
      config.useMockFallback &&
      !original?._fallback &&
      original?.url &&
      isFallbackEligible(original.url) &&
      (error.response?.status === 404 || error.response?.status === 503 || !error.response)
    ) {
      original._fallback = true
      const url = original.url ?? ''
      const method = (original.method ?? 'get').toLowerCase()
      const params = (original.params ?? {}) as Record<string, unknown>
      let body: unknown = null
      try { body = typeof original.data === 'string' ? JSON.parse(original.data) : original.data } catch { /* ignore */ }

      const mockData = matchDemoData(url, method, params, body)
      if (mockData !== null) {
        return Promise.resolve({
          data: mockData,
          status: 200,
          statusText: 'OK (mock-fallback)',
          headers: { 'content-type': 'application/json' },
          config: original,
          request: {},
        })
      }
    }

    // ── 401 auto-refresh ───────────────────────────────────────────────────────
    if (error.response?.status !== 401 || original?._retry) {
      // Show toast for server errors (not 401 which is handled by refresh)
      if (error.response?.status && error.response.status >= 500) {
        toast.error('Error del servidor. Intenta de nuevo.')
      } else if (!error.response && !isDemoMode()) {
        toast.warning('Sin conexión al servidor. Verifica que el backend esté levantado.')
      }
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem(TOKEN_KEYS.refresh)
    if (!refreshToken) {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          original!.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(original!))
        })
      })
    }

    original!._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
        refresh_token: refreshToken,
      })

      const newAccess: string = data.access_token
      const newRefresh: string = data.refresh_token

      localStorage.setItem(TOKEN_KEYS.access, newAccess)
      localStorage.setItem(TOKEN_KEYS.refresh, newRefresh)

      onTokenRefreshed(newAccess)
      original!.headers.Authorization = `Bearer ${newAccess}`

      return apiClient(original!)
    } catch {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.access)
  localStorage.removeItem(TOKEN_KEYS.refresh)
  localStorage.removeItem(TOKEN_KEYS.tenantId)
}

export default apiClient
