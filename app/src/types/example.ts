// Sample domain entity. Replace with your own — the query/route/CRUD wiring
// in `lib/queries/example.ts` and `app/routes/_layout/example*` follows the
// same shape the Cortex apps use for their entities.

import { z } from 'zod'

export type ExampleStatus = 'draft' | 'active' | 'archived'

// Shared react-hook-form schema for the create/edit forms (validated via
// @hookform/resolvers/zod). Define validation alongside the entity it guards.
export const exampleFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']),
})

export type ExampleFormValues = z.output<typeof exampleFormSchema>

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
