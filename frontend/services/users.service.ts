import apiClient from '@/lib/axios'
import type { User } from '@/types/auth'

export interface UserListResponse {
  items: User[]
  total: number
  skip: number
  limit: number
}

export interface UserDetail extends User {
  created_at: string
  updated_at: string
}

export interface UserCreateRequest {
  email: string
  password: string
  full_name: string
  role: User['role']
}

export interface UserUpdateRequest {
  full_name?: string
  role?: User['role']
  is_active?: boolean
  password?: string
}

export const usersService = {
  list: (skip = 0, limit = 50): Promise<UserListResponse> =>
    apiClient.get<UserListResponse>('/users', { params: { skip, limit } }).then((r) => r.data),

  getById: (id: string): Promise<UserDetail> =>
    apiClient.get<UserDetail>(`/users/${id}`).then((r) => r.data),

  create: (data: UserCreateRequest): Promise<UserDetail> =>
    apiClient.post<UserDetail>('/users', data).then((r) => r.data),

  update: (id: string, data: UserUpdateRequest): Promise<UserDetail> =>
    apiClient.patch<UserDetail>(`/users/${id}`, data).then((r) => r.data),

  deactivate: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/users/${id}`).then((r) => r.data),
}
