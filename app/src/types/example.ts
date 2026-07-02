// Sample domain entity. Replace with your own — the query/route/CRUD wiring
// in `lib/queries/example.ts` and `app/routes/_layout/example*` follows the
// same shape the Cortex apps use for their entities.

export type ExampleStatus = 'draft' | 'active' | 'archived'

export interface Example {
  id: number
  title: string
  description: string
  status: ExampleStatus
  created_at: string
  updated_at: string
}

export interface ExampleFilters {
  status?: ExampleStatus
  search?: string
  page?: number
  page_size?: number
}

export interface ExampleListResponse {
  items: Example[]
  total: number
}

export interface CreateExampleInput {
  title: string
  description?: string
  status?: ExampleStatus
}

export type UpdateExampleInput = Partial<CreateExampleInput>
