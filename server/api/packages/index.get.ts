import { and, eq } from 'drizzle-orm'
import { packages } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const serviceType = typeof q.serviceType === 'string' ? q.serviceType : undefined
  const db = useDb()
  const data = await db.query.packages.findMany({
    where: and(
      eq(packages.isActive, true),
      serviceType ? eq(packages.serviceType, serviceType as never) : undefined
    ),
    orderBy: (p, { asc }) => [asc(p.sortOrder), asc(p.priceYearlyIdr)]
  })
  return { data }
})
