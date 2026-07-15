import { and, eq } from 'drizzle-orm'
import { templates } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug wajib' })
  const db = useDb()
  const row = await db.query.templates.findFirst({
    where: and(eq(templates.slug, slug), eq(templates.isActive, true))
  })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Template tidak ditemukan' })
  return { data: row }
})
