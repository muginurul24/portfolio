import { z } from 'zod'
import { count, eq } from 'drizzle-orm'
import { courseModules, courses } from '../../../../database/schema'
import { createId } from '../../../../utils/id'

const bodySchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(160),
  contentMd: z.string().max(50000).optional().nullable(),
  videoUrl: z.string().url().optional().nullable().or(z.literal('')),
  sortOrder: z.number().int().optional().default(0),
  durationMinutes: z.number().int().min(0).optional().nullable(),
  hasQuiz: z.boolean().optional().default(false)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const courseId = getRouterParam(event, 'id')
  if (!courseId) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const course = await db.query.courses.findFirst({ where: eq(courses.id, courseId) })
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kursus tidak ditemukan' })

  const id = createId('mod')
  await db.insert(courseModules).values({
    id,
    courseId,
    slug: body.slug.toLowerCase().trim(),
    title: body.title.trim(),
    contentMd: body.contentMd?.trim() || null,
    videoUrl: body.videoUrl && body.videoUrl.trim() ? body.videoUrl.trim() : null,
    sortOrder: body.sortOrder,
    durationMinutes: body.durationMinutes ?? null,
    hasQuiz: body.hasQuiz
  })

  const [modCount] = await db
    .select({ value: count() })
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
  await db.update(courses).set({ moduleCount: modCount?.value ?? 0 }).where(eq(courses.id, courseId))

  const row = await db.query.courseModules.findFirst({ where: eq(courseModules.id, id) })
  return { data: row }
})
