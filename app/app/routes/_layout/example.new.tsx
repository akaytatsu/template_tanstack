'use client'

import React, { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateExample } from '@/lib/queries/example'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ExampleStatus } from '@/types/example'

export const Route = createFileRoute('/_layout/example/new')({
  component: ExampleNewPage,
})

function ExampleNewPage() {
  const navigate = useNavigate()
  const create = useCreateExample()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ExampleStatus>('draft')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await create.mutateAsync({ title, description, status })
      toast.success('Created')
      navigate({ to: '/example/$id', params: { id: String(created.id) } })
    } catch {
      toast.error('Failed to create')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/example">
          <ArrowLeft />
          Back
        </Link>
      </Button>

      <div>
        <h1 className="text-title-sm text-on-surface">New example</h1>
        <p className="text-body-sm text-on-surface-variant">Create a new example entity.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ExampleStatus)}
            className="h-9 w-full rounded-sm border ghost-border bg-transparent px-3 text-body-sm text-on-surface"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Creating…' : 'Create example'}
        </Button>
      </form>
    </div>
  )
}
