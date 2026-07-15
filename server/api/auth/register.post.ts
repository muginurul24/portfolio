import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { createId } from '../../utils/id'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const email = body.email.toLowerCase().trim()

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email)
  })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar' })
  }

  const passwordHash = await hashPassword(body.password)
  const id = createId('user')

  try {
    await db.insert(users).values({
      id,
      email,
      passwordHash,
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
      role: 'customer'
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const code = typeof err === 'object' && err && 'code' in err
      ? String((err as { code: unknown }).code)
      : ''
    // Race: concurrent register can pass findFirst then hit unique email.
    if (
      code.startsWith('SQLITE_CONSTRAINT')
      || message.includes('UNIQUE constraint failed')
    ) {
      throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar' })
    }
    throw err
  }

  await setUserSession(event, {
    user: {
      id,
      email,
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
      role: 'customer'
    }
  })

  return { ok: true }
})
