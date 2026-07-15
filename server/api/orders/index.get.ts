import { eq, or } from 'drizzle-orm'
import { orders } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = sessionUser(session)
  const db = useDb()

  if (isStaffRole(user.role)) {
    const data = await db.query.orders.findMany({
      orderBy: (o, { desc: d }) => [d(o.createdAt)],
      limit: 100
    })
    return { data }
  }

  const email = user.email?.toLowerCase().trim()
  const data = await db.query.orders.findMany({
    where: email
      ? or(eq(orders.userId, user.id), eq(orders.customerEmail, email))
      : eq(orders.userId, user.id),
    orderBy: (o, { desc: d }) => [d(o.createdAt)]
  })
  return { data }
})
