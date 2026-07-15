import { eq } from 'drizzle-orm'
import { sites } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = sessionUser(session)
  const db = useDb()
  if (isStaffRole(user.role)) {
    return { data: await db.query.sites.findMany({ limit: 100 }) }
  }
  return { data: await db.query.sites.findMany({ where: eq(sites.userId, user.id) }) }
})
