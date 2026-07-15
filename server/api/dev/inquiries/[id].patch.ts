import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { inquiries } from '../../../database/schema'

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const

const bodySchema = z.object({
  status: z.enum(STATUSES).optional(),
  message: z.string().max(4000).nullable().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  await requireRole(event, ['cs', 'admin', 'dev'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const existing = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Inquiry tidak ditemukan' })

  const patch: Record<string, unknown> = {}
  if (body.status !== undefined) patch.status = body.status
  if (body.message !== undefined) patch.message = body.message

  await db.update(inquiries).set(patch).where(eq(inquiries.id, id))
  const row = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) })
  return { data: row }
})
