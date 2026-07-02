'use client'

import React, { useState } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useExample, useUpdateExample, useDeleteExample } from '@/lib/queries/example'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import type { Example, ExampleStatus } from '@/types/example'

export const Route = createFileRoute('/_layout/example/$id')({
  component: ExampleDetailPage,
})

function ExampleDetailPage() {
  const { id } = Route.useParams()
  const numericId = Number(id)
  const { data, isLoading, isError } = useExample(numericId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <BackButton />
        <p className="text-body-sm text-k-error">Could not load this example.</p>
      </div>
    )
  }

  // Remount (and re-seed the form) whenever the loaded entity changes.
  return <ExampleForm key={data.id} example={data} />
}

function ExampleForm({ example }: { example: Example }) {
  const navigate = useNavigate()
  const update = useUpdateExample(example.id)
  const remove = useDeleteExample()

  // Seeded from props via the useState initializer — no effect needed.
  const [title, setTitle] = useState(example.title)
  const [description, setDescription] = useState(example.description)
  const [status, setStatus] = useState<ExampleStatus>(example.status)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await update.mutateAsync({ title, description, status })
      toast.success('Saved')
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(example.id)
      toast.success('Deleted')
      navigate({ to: '/example' })
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <Button variant="ghost" size="sm" onClick={handleDelete} disabled={remove.isPending}>
          <Trash2 />
          Delete
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
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

        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  )
}

function BackButton() {
  return (
    <Button asChild variant="ghost" size="sm">
      <Link to="/example">
        <ArrowLeft />
        Back
      </Link>
    </Button>
  )
}
