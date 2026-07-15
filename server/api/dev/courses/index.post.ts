import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { courses } from '../../../database/schema'
import { createId } from '../../../utils/id'

const bodySchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(2).max(160),
  description: z.string().max(4000).optional().nullable(),
  level: z.enum(['beginner', 'advanced']).optional().default('beginner'),
  isPublished: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const slug = body.slug.toLowerCase().trim()
  const clash = await db.query.courses.findFirst({ where: eq(courses.slug, slug) })
  if (clash) throw createError({ statusCode: 409, statusMessage: 'Slug kursus sudah dipakai' })

  const id = createId('course')
  await db.insert(courses).values({
    id,
    slug,
    title: body.title.trim(),
    description: body.description?.trim() || null,
    level: body.level,
    moduleCount: 0,
    isPublished: body.isPublished,
    sortOrder: body.sortOrder
  })

  const row = await db.query.courses.findFirst({ where: eq(courses.id, id) })
  return { data: row }
})
