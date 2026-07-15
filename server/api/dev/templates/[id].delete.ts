import { eq } from 'drizzle-orm'
import { templates } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const existing = await db.query.templates.findFirst({ where: eq(templates.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Template tidak ditemukan' })

  await db.delete(templates).where(eq(templates.id, id))
  return { ok: true }
})
