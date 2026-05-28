'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersService, UserCreateRequest, UserUpdateRequest } from '@/services/users.service'

export const USERS_KEYS = {
  all: ['users'] as const,
  list: (skip: number, limit: number) => [...USERS_KEYS.all, 'list', skip, limit] as const,
  detail: (id: string) => [...USERS_KEYS.all, 'detail', id] as const,
}

export function useUsers(skip = 0, limit = 50) {
  return useQuery({
    queryKey: USERS_KEYS.list(skip, limit),
    queryFn: () => usersService.list(skip, limit),
    staleTime: 30_000,
  })
}

export function useUser(id: string | null) {
  return useQuery({
    queryKey: USERS_KEYS.detail(id ?? ''),
    queryFn: () => usersService.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserCreateRequest) => usersService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEYS.all }),
  })
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserUpdateRequest) => usersService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: USERS_KEYS.all })
    },
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEYS.all }),
  })
}
