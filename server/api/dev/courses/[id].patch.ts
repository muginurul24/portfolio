import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { courses } from '../../../database/schema'

const bodySchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  title: z.string().min(2).max(160).optional(),
  description: z.string().max(4000).nullable().optional(),
  level: z.enum(['beginner', 'advanced']).optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const existing = await db.query.courses.findFirst({ where: eq(courses.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kursus tidak ditemukan' })

  if (body.slug) {
    const slug = body.slug.toLowerCase().trim()
    const clash = await db.query.courses.findFirst({ where: eq(courses.slug, slug) })
    if (clash && clash.id !== id) {
      throw createError({ statusCode: 409, statusMessage: 'Slug kursus sudah dipakai' })
    }
  }

  const patch: Record<string, unknown> = {}
  if (body.slug !== undefined) patch.slug = body.slug.toLowerCase().trim()
  if (body.title !== undefined) patch.title = body.title.trim()
  if (body.description !== undefined) patch.description = body.description?.trim() || null
  if (body.level !== undefined) patch.level = body.level
  if (body.isPublished !== undefined) patch.isPublished = body.isPublished
  if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder

  await db.update(courses).set(patch).where(eq(courses.id, id))
  const row = await db.query.courses.findFirst({ where: eq(courses.id, id) })
  return { data: row }
})
