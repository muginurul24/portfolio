import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { templates } from '../../../database/schema'

const categories = [
  'export', 'umkm', 'ecommerce', 'company', 'agriculture',
  'craft', 'automotive', 'restaurant', 'service', 'custom'
] as const

const bodySchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  category: z.enum(categories).optional(),
  tags: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().nullable().optional().or(z.literal('')),
  previewUrl: z.string().url().nullable().optional().or(z.literal('')),
  demoUrl: z.string().url().nullable().optional().or(z.literal('')),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const existing = await db.query.templates.findFirst({ where: eq(templates.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Template tidak ditemukan' })

  if (body.slug) {
    const slug = body.slug.toLowerCase().trim()
    const clash = await db.query.templates.findFirst({ where: eq(templates.slug, slug) })
    if (clash && clash.id !== id) {
      throw createError({ statusCode: 409, statusMessage: 'Slug template sudah dipakai' })
    }
  }

  const emptyToNull = (v?: string | null) => {
    if (v === undefined) return undefined
    return v && v.trim() ? v.trim() : null
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() }
  if (body.slug !== undefined) patch.slug = body.slug.toLowerCase().trim()
  if (body.name !== undefined) patch.name = body.name.trim()
  if (body.description !== undefined) patch.description = body.description?.trim() || null
  if (body.category !== undefined) patch.category = body.category
  if (body.tags !== undefined) patch.tags = body.tags
  if (body.thumbnailUrl !== undefined) patch.thumbnailUrl = emptyToNull(body.thumbnailUrl)
  if (body.previewUrl !== undefined) patch.previewUrl = emptyToNull(body.previewUrl)
  if (body.demoUrl !== undefined) patch.demoUrl = emptyToNull(body.demoUrl)
  if (body.isFeatured !== undefined) patch.isFeatured = body.isFeatured
  if (body.isActive !== undefined) patch.isActive = body.isActive
  if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder

  await db.update(templates).set(patch).where(eq(templates.id, id))
  const row = await db.query.templates.findFirst({ where: eq(templates.id, id) })
  return { data: row }
})
