import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users } from '../../../database/schema'
import { createId } from '../../../utils/id'
import type { UserRole } from '../../../../app/utils/roles'
import { canPromoteDev } from '../../../../app/utils/roles'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20).optional().nullable(),
  role: z.enum(['customer', 'cs', 'admin', 'dev']).default('customer')
})

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['admin', 'dev'])
  const actor = sessionUser(session)
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const role = body.role as UserRole
  if (role === 'dev' && !canPromoteDev(actor.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Hanya dev yang boleh membuat akun dev' })
  }

  const email = body.email.toLowerCase().trim()
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar' })
  }

  const id = createId('user')
  const passwordHash = await hashPassword(body.password)

  await db.insert(users).values({
    id,
    email,
    name: body.name.trim(),
    phone: body.phone?.trim() || null,
    role,
    passwordHash
  })

  const row = await db.query.users.findFirst({ where: eq(users.id, id) })
  return {
    data: {
      id: row!.id,
      email: row!.email,
      name: row!.name,
      phone: row!.phone,
      role: row!.role,
      createdAt: row!.createdAt,
      updatedAt: row!.updatedAt
    }
  }
})
