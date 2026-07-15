import { eq, or } from 'drizzle-orm'
import { orders } from '../../database/schema'
import { signPayToken } from '../../utils/pay-token'

function withPayPaths<T extends { id: string, status: string }>(rows: T[]) {
  const config = useRuntimeConfig()
  const secret = String(config.payTokenSecret || config.session?.password || '')
  if (secret.length < 32) {
    return rows.map(row => ({
      ...row,
      payPath: null as string | null
    }))
  }

  return rows.map((row) => {
    if (row.status !== 'pending_payment') {
      return { ...row, payPath: null as string | null }
    }
    const token = signPayToken(row.id, secret)
    return {
      ...row,
      payPath: `/order/pay/${row.id}?token=${encodeURIComponent(token)}`
    }
  })
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = sessionUser(session)
  const db = useDb()

  if (isStaffRole(user.role)) {
    const data = await db.query.orders.findMany({
      orderBy: (o, { desc: d }) => [d(o.createdAt)],
      limit: 100
    })
    return { data: withPayPaths(data) }
  }

  const email = user.email?.toLowerCase().trim()
  const data = await db.query.orders.findMany({
    where: email
      ? or(eq(orders.userId, user.id), eq(orders.customerEmail, email))
      : eq(orders.userId, user.id),
    orderBy: (o, { desc: d }) => [d(o.createdAt)]
  })
  return { data: withPayPaths(data) }
})
