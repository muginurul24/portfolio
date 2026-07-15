import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { testimonials } from '../../../database/schema'

const bodySchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.string().max(120).nullable().optional(),
  company: z.string().max(120).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional().or(z.literal('')),
  content: z.string().min(10).max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const existing = await db.query.testimonials.findFirst({ where: eq(testimonials.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Testimoni tidak ditemukan' })

  const patch: Record<string, unknown> = {}
  if (body.name !== undefined) patch.name = body.name.trim()
  if (body.role !== undefined) patch.role = body.role?.trim() || null
  if (body.company !== undefined) patch.company = body.company?.trim() || null
  if (body.avatarUrl !== undefined) {
    patch.avatarUrl = body.avatarUrl && body.avatarUrl.trim() ? body.avatarUrl.trim() : null
  }
  if (body.content !== undefined) patch.content = body.content.trim()
  if (body.rating !== undefined) patch.rating = body.rating
  if (body.isFeatured !== undefined) patch.isFeatured = body.isFeatured
  if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder
  if (body.isActive !== undefined) patch.isActive = body.isActive

  await db.update(testimonials).set(patch).where(eq(testimonials.id, id))
  const row = await db.query.testimonials.findFirst({ where: eq(testimonials.id, id) })
  return { data: row }
})
