import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

// This test also verifies that @testing-library/jest-dom matchers
// (e.g. toBeInTheDocument) are loaded via vitest `setupFiles`.
describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('renders as a child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/somewhere">Link button</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Link button' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/somewhere')
  })
})
