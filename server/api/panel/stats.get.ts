import { eq, or } from 'drizzle-orm'
import { sites, orders, courseProgress } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const user = session.user as { id: string, email?: string }
  const db = useDb()
  const userSites = await db.query.sites.findMany({ where: eq(sites.userId, user.id) })
  const email = user.email?.toLowerCase().trim()
  const userOrders = await db.query.orders.findMany({
    where: email
      ? or(eq(orders.userId, user.id), eq(orders.customerEmail, email))
      : eq(orders.userId, user.id)
  })
  const siteIds = new Set(userSites.map(s => s.id))
  const allInquiries = siteIds.size ? await db.query.inquiries.findMany() : []
  const inquiryCount = allInquiries.filter(i => i.siteId && siteIds.has(i.siteId) && i.status === 'new').length
  const progress = await db.query.courseProgress.findMany({ where: eq(courseProgress.userId, user.id) })

  return {
    data: {
      activeSites: userSites.filter(s => s.status === 'active').length,
      provisioningSites: userSites.filter(s => s.status === 'provisioning').length,
      orders: userOrders.length,
      newInquiries: inquiryCount,
      academyCompleted: progress.filter(p => p.completedAt).length
    }
  }
})
