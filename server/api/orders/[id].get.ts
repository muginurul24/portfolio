import { eq } from 'drizzle-orm'
import { orders } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = sessionUser(session)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })
  const db = useDb()
  const row = await db.query.orders.findFirst({ where: eq(orders.id, id) })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })
  const email = user.email?.toLowerCase().trim()
  if (!isStaffRole(user.role) && row.userId !== user.id && row.customerEmail !== email) {
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  }
  return { data: row }
})
