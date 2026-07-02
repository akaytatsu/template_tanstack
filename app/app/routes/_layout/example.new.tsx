'use client'

import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateExample } from '@/lib/queries/example'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { exampleFormSchema, type ExampleFormValues } from '@/types/example'

export const Route = createFileRoute('/_layout/example/new')({
  component: ExampleNewPage,
})

function ExampleNewPage() {
  const navigate = useNavigate()
  const create = useCreateExample()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExampleFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(exampleFormSchema) as any,
    defaultValues: { title: '', description: '', status: 'draft' },
  })

  const onSubmit = async (data: ExampleFormValues) => {
    try {
      const created = await create.mutateAsync(data)
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} />
          {errors.title && <p className="text-body-sm text-k-error">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={5} {...register('description')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            {...register('status')}
            className="h-9 w-full rounded-sm border ghost-border bg-transparent px-3 text-body-sm text-on-surface"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create example'}
        </Button>
      </form>
    </div>
  )
}
