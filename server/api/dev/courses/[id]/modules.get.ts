import { asc, eq } from 'drizzle-orm'
import { courseModules, courses } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const course = await db.query.courses.findFirst({ where: eq(courses.id, id) })
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Kursus tidak ditemukan' })

  const rows = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, id))
    .orderBy(asc(courseModules.sortOrder))

  return { data: rows, meta: { courseId: id, total: rows.length } }
})
