import { z } from 'zod'
import { evaluateDomainStub } from '../../utils/domain-availability'

const querySchema = z.object({
  name: z.string().min(3).max(63).regex(/^[a-z0-9-]+$/i),
  tld: z.string().min(2).max(20)
})

export default defineEventHandler(async (event) => {
  const raw = getQuery(event)
  const parsed = querySchema.safeParse({ name: raw.name, tld: raw.tld })
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Nama domain tidak valid' })
  }
  return evaluateDomainStub(parsed.data.name, parsed.data.tld)
})
