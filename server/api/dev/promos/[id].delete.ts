import { eq } from 'drizzle-orm'
import { promoCodes } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const existing = await db.query.promoCodes.findFirst({ where: eq(promoCodes.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Promo tidak ditemukan' })

  await db.delete(promoCodes).where(eq(promoCodes.id, id))
  return { ok: true }
})
