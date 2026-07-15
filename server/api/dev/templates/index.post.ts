import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { templates } from '../../../database/schema'
import { createId } from '../../../utils/id'

const categories = [
  'export', 'umkm', 'ecommerce', 'company', 'agriculture',
  'craft', 'automotive', 'restaurant', 'service', 'custom'
] as const

const bodySchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum(categories),
  tags: z.array(z.string()).optional().default([]),
  thumbnailUrl: z.string().url().optional().nullable().or(z.literal('')),
  previewUrl: z.string().url().optional().nullable().or(z.literal('')),
  demoUrl: z.string().url().optional().nullable().or(z.literal('')),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const slug = body.slug.toLowerCase().trim()
  const clash = await db.query.templates.findFirst({ where: eq(templates.slug, slug) })
  if (clash) {
    throw createError({ statusCode: 409, statusMessage: 'Slug template sudah dipakai' })
  }

  const id = createId('tpl')
  const emptyToNull = (v?: string | null) => (v && v.trim() ? v.trim() : null)

  await db.insert(templates).values({
    id,
    slug,
    name: body.name.trim(),
    description: body.description?.trim() || null,
    category: body.category,
    tags: body.tags ?? [],
    thumbnailUrl: emptyToNull(body.thumbnailUrl),
    previewUrl: emptyToNull(body.previewUrl),
    demoUrl: emptyToNull(body.demoUrl),
    isFeatured: body.isFeatured,
    isActive: body.isActive,
    sortOrder: body.sortOrder
  })

  const row = await db.query.templates.findFirst({ where: eq(templates.id, id) })
  return { data: row }
})
