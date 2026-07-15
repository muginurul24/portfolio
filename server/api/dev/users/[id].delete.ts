import { and, count, eq, ne } from 'drizzle-orm'
import { users } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireRole(event, ['admin', 'dev'])
  const actor = sessionUser(session)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

  if (actor.id === id) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menghapus akun sendiri' })
  }

  const db = useDb()
  const existing = await db.query.users.findFirst({ where: eq(users.id, id) })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })

  if (existing.role === 'dev') {
    if (actor.role !== 'dev') {
      throw createError({ statusCode: 403, statusMessage: 'Hanya dev yang boleh hapus akun dev' })
    }
    const [otherDevs] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, 'dev'), ne(users.id, id)))
    if ((otherDevs?.value ?? 0) < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menghapus dev terakhir' })
    }
  }

  await db.delete(users).where(eq(users.id, id))
  return { ok: true }
})
