import { eq } from 'drizzle-orm'
import { sites } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  const user = session.user as { id: string, role: string }
  const db = useDb()
  if (user.role === 'admin') {
    return { data: await db.query.sites.findMany({ limit: 100 }) }
  }
  return { data: await db.query.sites.findMany({ where: eq(sites.userId, user.id) }) }
})
