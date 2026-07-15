import { eq } from 'drizzle-orm'
import { domainTlds } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const existing = await db.query.domainTlds.findFirst({ where: eq(domainTlds.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'TLD tidak ditemukan' })

  await db.delete(domainTlds).where(eq(domainTlds.id, id))
  return { ok: true }
})
