import { count, eq, inArray, sum } from 'drizzle-orm'
import { inquiries, orders, payments, promoCodes, sites, users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const db = useDb()

  const [usersRow] = await db.select({ value: count() }).from(users)
  const [sitesProvisioningRow] = await db
    .select({ value: count() })
    .from(sites)
    .where(eq(sites.status, 'provisioning'))
  const [openInquiriesRow] = await db
    .select({ value: count() })
    .from(inquiries)
    .where(eq(inquiries.status, 'new'))
  const [activePromosRow] = await db
    .select({ value: count() })
    .from(promoCodes)
    .where(eq(promoCodes.isActive, true))

  const statusRows = await db
    .select({
      status: orders.status,
      value: count()
    })
    .from(orders)
    .groupBy(orders.status)

  const ordersByStatus = Object.fromEntries(
    statusRows.map(r => [r.status, r.value])
  ) as Record<string, number>

  const [paidPayments] = await db
    .select({ value: sum(payments.amountIdr) })
    .from(payments)
    .where(eq(payments.status, 'paid'))

  const paidFromPayments = Number(paidPayments?.value ?? 0)
  let paidRevenueIdr = paidFromPayments

  if (!paidFromPayments) {
    const [paidOrders] = await db
      .select({ value: sum(orders.totalIdr) })
      .from(orders)
      .where(inArray(orders.status, ['paid', 'provisioning', 'active']))
    paidRevenueIdr = Number(paidOrders?.value ?? 0)
  }

  return {
    data: {
      users: usersRow?.value ?? 0,
      ordersByStatus,
      paidRevenueIdr,
      sitesProvisioning: sitesProvisioningRow?.value ?? 0,
      openInquiries: openInquiriesRow?.value ?? 0,
      activePromos: activePromosRow?.value ?? 0
    }
  }
})