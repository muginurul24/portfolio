import { count, eq } from 'drizzle-orm'
import { courseModules, courses } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const existing = await db.query.courseModules.findFirst({ where: eq(courseModules.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Modul tidak ditemukan' })

  const courseId = existing.courseId
  await db.delete(courseModules).where(eq(courseModules.id, id))

  const [modCount] = await db
    .select({ value: count() })
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
  await db.update(courses).set({ moduleCount: modCount?.value ?? 0 }).where(eq(courses.id, courseId))

  return { ok: true }
})
