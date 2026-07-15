import { eq, and, like, or } from 'drizzle-orm'
import { templates } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = typeof query.category === 'string' ? query.category : undefined
  const q = typeof query.q === 'string' ? query.q.trim() : ''

  try {
    const db = useDb()
    const rows = await db.query.templates.findMany({
      where: and(
        eq(templates.isActive, true),
        category && category !== 'all' ? eq(templates.category, category as never) : undefined,
        q
          ? or(
              like(templates.name, `%${q}%`),
              like(templates.slug, `%${q}%`)
            )
          : undefined
      ),
      orderBy: (t, { asc }) => [asc(t.sortOrder), asc(t.name)]
    })
    return { data: rows }
  } catch {
    // DB not migrated yet - empty catalog
    return { data: [] }
  }
})
