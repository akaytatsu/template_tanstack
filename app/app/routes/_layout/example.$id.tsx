'use client'

import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useExample, useUpdateExample, useDeleteExample } from '@/lib/queries/example'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { exampleFormSchema, type Example, type ExampleFormValues } from '@/types/example'

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

  // Remount (and re-seed the form defaults) whenever the loaded entity changes.
  return <ExampleForm key={data.id} example={data} />
}

function ExampleForm({ example }: { example: Example }) {
  const navigate = useNavigate()
  const update = useUpdateExample(example.id)
  const remove = useDeleteExample()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExampleFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(exampleFormSchema) as any,
    defaultValues: {
      title: example.title,
      description: example.description,
      status: example.status,
    },
  })

  const onSubmit = async (data: ExampleFormValues) => {
    try {
      await update.mutateAsync(data)
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
          {isSubmitting ? 'Saving…' : 'Save changes'}
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
