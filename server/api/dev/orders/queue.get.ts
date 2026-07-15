import { asc, eq, inArray, sql } from 'drizzle-orm'
import { orders, sites } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['dev', 'admin'])
  const db = useDb()

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      domainName: orders.domainName,
      domainTld: orders.domainTld,
      totalIdr: orders.totalIdr,
      notes: orders.notes,
      paidAt: orders.paidAt,
      createdAt: orders.createdAt,
      siteId: sites.id,
      siteStatus: sites.status,
      siteDomain: sites.domain
    })
    .from(orders)
    .leftJoin(sites, eq(sites.orderId, orders.id))
    .where(inArray(orders.status, ['paid', 'provisioning']))
    .orderBy(
      asc(sql`coalesce(${orders.paidAt}, ${orders.createdAt})`),
      asc(orders.createdAt)
    )

  return { data: rows }
})
