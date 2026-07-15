import { eq } from 'drizzle-orm'
import { orders } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const user = session.user as { id: string, role: string }
  const db = useDb()

  if (user.role === 'admin' || user.role === 'cs') {
    const data = await db.query.orders.findMany({
      orderBy: (o, { desc: d }) => [d(o.createdAt)],
      limit: 100
    })
    return { data }
  }

  const data = await db.query.orders.findMany({
    where: eq(orders.userId, user.id),
    orderBy: (o, { desc: d }) => [d(o.createdAt)]
  })
  return { data }
})
