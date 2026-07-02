import { describe, it, expect } from 'vitest'
import { exampleFormSchema } from '@/types/example'

// Guards the shared react-hook-form schema used by the example create/edit forms.
describe('exampleFormSchema', () => {
  it('accepts valid input', () => {
    const result = exampleFormSchema.safeParse({
      title: 'Hello world',
      description: 'A description',
      status: 'active',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a title shorter than 3 characters', () => {
    const result = exampleFormSchema.safeParse({ title: 'ab', status: 'draft' })
    expect(result.success).toBe(false)
  })

  it('rejects an unknown status', () => {
    const result = exampleFormSchema.safeParse({ title: 'Hello world', status: 'nope' })
    expect(result.success).toBe(false)
  })
})
