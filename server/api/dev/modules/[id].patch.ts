import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { courseModules } from '../../../database/schema'

const bodySchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  title: z.string().min(2).max(160).optional(),
  contentMd: z.string().max(50000).nullable().optional(),
  videoUrl: z.string().url().nullable().optional().or(z.literal('')),
  sortOrder: z.number().int().optional(),
  durationMinutes: z.number().int().min(0).nullable().optional(),
  hasQuiz: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const existing = await db.query.courseModules.findFirst({ where: eq(courseModules.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Modul tidak ditemukan' })

  const patch: Record<string, unknown> = {}
  if (body.slug !== undefined) patch.slug = body.slug.toLowerCase().trim()
  if (body.title !== undefined) patch.title = body.title.trim()
  if (body.contentMd !== undefined) patch.contentMd = body.contentMd?.trim() || null
  if (body.videoUrl !== undefined) {
    patch.videoUrl = body.videoUrl && body.videoUrl.trim() ? body.videoUrl.trim() : null
  }
  if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder
  if (body.durationMinutes !== undefined) patch.durationMinutes = body.durationMinutes
  if (body.hasQuiz !== undefined) patch.hasQuiz = body.hasQuiz

  await db.update(courseModules).set(patch).where(eq(courseModules.id, id))
  const row = await db.query.courseModules.findFirst({ where: eq(courseModules.id, id) })
  return { data: row }
})
