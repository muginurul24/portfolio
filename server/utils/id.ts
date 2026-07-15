import { randomBytes } from 'node:crypto'

export function createId(prefix = 'id'): string {
  return `${prefix}_${randomBytes(12).toString('hex')}`
}

export function createOrderNumber(date = new Date()): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  const suffix = randomBytes(2).toString('hex').toUpperCase()
  return `MD-${y}${m}${d}-${suffix}`
}
