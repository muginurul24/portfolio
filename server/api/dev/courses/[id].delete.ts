import { eq } from 'drizzle-orm'
import { courseModules, courses } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const existing = await db.query.courses.findFirst({ where: eq(courses.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kursus tidak ditemukan' })

  await db.delete(courseModules).where(eq(courseModules.courseId, id))
  await db.delete(courses).where(eq(courses.id, id))
  return { ok: true }
})
