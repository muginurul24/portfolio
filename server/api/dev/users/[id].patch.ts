import { z } from 'zod'
import { and, count, eq, ne } from 'drizzle-orm'
import { users } from '../../../database/schema'
import type { UserRole } from '../../../../app/utils/roles'
import { canPromoteDev } from '../../../../app/utils/roles'

const bodySchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(8).max(20).nullable().optional(),
  role: z.enum(['customer', 'cs', 'admin', 'dev']).optional(),
  password: z.string().min(8).max(128).optional()
}).refine(data => Object.keys(data).length > 0, { message: 'Tidak ada field diubah' })

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['admin', 'dev'])
  const actor = sessionUser(session)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const existing = await db.query.users.findFirst({ where: eq(users.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })

  if (body.role === 'dev' && !canPromoteDev(actor.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Hanya dev yang boleh promote ke dev' })
  }

  // Prevent demoting/removing last dev
  if (existing.role === 'dev' && body.role && body.role !== 'dev') {
    const [devCount] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, 'dev'), ne(users.id, id)))
    if ((devCount?.value ?? 0) < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menurunkan dev terakhir' })
    }
  }

  if (body.email) {
    const email = body.email.toLowerCase().trim()
    const clash = await db.query.users.findFirst({ where: eq(users.email, email) })
    if (clash && clash.id !== id) {
      throw createError({ statusCode: 409, statusMessage: 'Email sudah dipakai' })
    }
  }

  const patch: Record<string, unknown> = {
    updatedAt: new Date()
  }
  if (body.name !== undefined) patch.name = body.name.trim()
  if (body.email !== undefined) patch.email = body.email.toLowerCase().trim()
  if (body.phone !== undefined) patch.phone = body.phone?.trim() || null
  if (body.role !== undefined) patch.role = body.role as UserRole
  if (body.password) patch.passwordHash = await hashPassword(body.password)

  await db.update(users).set(patch).where(eq(users.id, id))

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
