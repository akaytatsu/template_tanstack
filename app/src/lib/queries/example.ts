import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import type {
  Example,
  ExampleFilters,
  ExampleListResponse,
  CreateExampleInput,
  UpdateExampleInput,
} from '@/types/example'

// Query-key factory — the single source of truth for this entity's cache keys.
// Mutations invalidate through these helpers so lists/details stay consistent.
export const exampleKeys = {
  all: ['examples'] as const,
  lists: () => [...exampleKeys.all, 'list'] as const,
  list: (filters: ExampleFilters) => [...exampleKeys.lists(), filters] as const,
  details: () => [...exampleKeys.all, 'detail'] as const,
  detail: (id: number) => [...exampleKeys.details(), id] as const,
}

export function useExamples(
  filters: ExampleFilters = {},
): UseQueryResult<ExampleListResponse, Error> {
  return useQuery({
    queryKey: exampleKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.search) params.set('search', filters.search)
      if (filters.page) params.set('page', String(filters.page))
      if (filters.page_size) params.set('page_size', String(filters.page_size))

      const qs = params.toString()
      const { data, status } = await api.get<ExampleListResponse>(`examples${qs ? `?${qs}` : ''}`)
      if (status === 0 || !data) throw new Error('Failed to fetch examples')
      return data
    },
    staleTime: 15_000,
  })
}

export function useExample(id: number): UseQueryResult<Example, Error> {
  return useQuery({
    queryKey: exampleKeys.detail(id),
    queryFn: async () => {
      const { data, status } = await api.get<Example>(`examples/${id}`)
      if (status === 0 || !data) throw new Error('Failed to fetch example')
      return data
    },
    enabled: Number.isFinite(id),
  })
}

export function useCreateExample(): UseMutationResult<Example, Error, CreateExampleInput> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateExampleInput) => {
      const { data, status } = await api.post<Example>('examples', input)
      if (status >= 400 || !data) throw new Error('Failed to create example')
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exampleKeys.lists() })
    },
  })
}

export function useUpdateExample(
  id: number,
): UseMutationResult<Example, Error, UpdateExampleInput> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateExampleInput) => {
      const { data, status } = await api.put<Example>(`examples/${id}`, input)
      if (status >= 400 || !data) throw new Error('Failed to update example')
      return data
    },
    onSuccess: () => {
      // Dual invalidation: refresh both the list and this item's detail.
      qc.invalidateQueries({ queryKey: exampleKeys.lists() })
      qc.invalidateQueries({ queryKey: exampleKeys.detail(id) })
    },
  })
}

export function useDeleteExample(): UseMutationResult<void, Error, number> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { status } = await api.delete<void>(`examples/${id}`)
      if (status >= 400) throw new Error('Failed to delete example')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: exampleKeys.lists() })
    },
  })
}
