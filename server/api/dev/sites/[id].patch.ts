import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { sites } from '../../../database/schema'

const STATUSES = ['provisioning', 'active', 'suspended', 'expired'] as const

const bodySchema = z.object({
  status: z.enum(STATUSES).optional(),
  adminUrl: z.string().url().nullable().optional().or(z.literal('')),
  expiresAt: z.string().datetime().nullable().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  await requireRole(event, ['cs', 'admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const existing = await db.query.sites.findFirst({ where: eq(sites.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Website tidak ditemukan' })

  const patch: Record<string, unknown> = { updatedAt: new Date() }
  if (body.status !== undefined) patch.status = body.status
  if (body.adminUrl !== undefined) {
    patch.adminUrl = body.adminUrl && body.adminUrl.trim() ? body.adminUrl.trim() : null
  }
  if (body.expiresAt !== undefined) {
    patch.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
  }

  await db.update(sites).set(patch).where(eq(sites.id, id))
  const row = await db.query.sites.findFirst({ where: eq(sites.id, id) })
  return { data: row }
})
