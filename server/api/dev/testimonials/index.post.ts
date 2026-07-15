import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { testimonials } from '../../../database/schema'
import { createId } from '../../../utils/id'

const bodySchema = z.object({
  name: z.string().min(2).max(120),
  role: z.string().max(120).optional().nullable(),
  company: z.string().max(120).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal('')),
  content: z.string().min(10).max(2000),
  rating: z.number().int().min(1).max(5).optional().default(5),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['admin', 'dev'])
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const id = createId('tstm')

  await db.insert(testimonials).values({
    id,
    name: body.name.trim(),
    role: body.role?.trim() || null,
    company: body.company?.trim() || null,
    avatarUrl: body.avatarUrl && body.avatarUrl.trim() ? body.avatarUrl.trim() : null,
    content: body.content.trim(),
    rating: body.rating,
    isFeatured: body.isFeatured,
    sortOrder: body.sortOrder,
    isActive: body.isActive
  })

  const row = await db.query.testimonials.findFirst({ where: eq(testimonials.id, id) })
  return { data: row }
})
