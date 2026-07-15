import { eq } from 'drizzle-orm'
import { packages } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const db = useDb()
  const existing = await db.query.packages.findFirst({ where: eq(packages.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Paket tidak ditemukan' })

  await db.delete(packages).where(eq(packages.id, id))
  return { ok: true }
})
