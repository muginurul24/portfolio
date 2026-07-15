import { eq } from 'drizzle-orm'
import { domainTlds } from '../../database/schema'

export default defineEventHandler(async () => {
  const db = useDb()
  const data = await db.query.domainTlds.findMany({
    where: eq(domainTlds.isActive, true)
  })
  return { data }
})
