import apiClient from '@/lib/axios'
import type { LoginRequest, RegisterRequest, RegisterResponse, TokenPair, User } from '@/types/auth'

export const authService = {
  async login(data: LoginRequest): Promise<TokenPair> {
    const res = await apiClient.post<TokenPair>('/auth/login', data)
    return res.data
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const res = await apiClient.post<RegisterResponse>('/auth/register', data)
    return res.data
  },

  async refresh(refreshToken: string): Promise<TokenPair> {
    const res = await apiClient.post<TokenPair>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return res.data
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refresh_token: refreshToken })
  },

  async me(): Promise<User> {
    const res = await apiClient.get<User>('/auth/me')
    return res.data
  },
}
