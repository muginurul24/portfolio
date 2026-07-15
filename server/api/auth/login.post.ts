import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  const user = await db.query.users.findFirst({
    where: eq(users.email, body.email.toLowerCase())
  })

  if (!user || !user.passwordHash) {
    throw createError({ statusCode: 401, statusMessage: 'Email atau kata sandi salah' })
  }

  const valid = await verifyPassword(user.passwordHash, body.password)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Email atau kata sandi salah' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  })

  return { ok: true }
})
