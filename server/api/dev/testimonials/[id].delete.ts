import { eq } from 'drizzle-orm'
import { testimonials } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const existing = await db.query.testimonials.findFirst({ where: eq(testimonials.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Testimoni tidak ditemukan' })

  await db.delete(testimonials).where(eq(testimonials.id, id))
  return { ok: true }
})
