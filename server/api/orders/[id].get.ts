import { eq } from 'drizzle-orm'
import { orders } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const user = session.user as { id: string; role: string; email?: string }
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })
  const db = useDb()
  const row = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })
  const isStaff = user.role === 'admin' || user.role === 'cs'
  if (!isStaff && row.userId !== user.id && row.customerEmail !== user.email) {
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  }
  return { data: row }
})
