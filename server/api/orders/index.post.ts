import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { orders, packages, domainTlds, promoCodes, templates, payments } from '../../database/schema'
import { createId, createOrderNumber } from '../../utils/id'
import { computeOrderTotals } from '../../utils/pricing'

const bodySchema = z.object({
  packageId: z.string().min(1),
  templateId: z.string().optional(),
  templateSlug: z.string().optional(),
  domainName: z.string().min(3).max(80),
  domainTld: z.string().min(2).max(20),
  termYears: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(1),
  promoCode: z.string().max(40).optional(),
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8).max(20).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()
  const session = await getUserSession(event)

  const pkg = await db.query.packages.findFirst({
    where: and(eq(packages.id, body.packageId), eq(packages.isActive, true))
  })
  if (!pkg) throw createError({ statusCode: 400, statusMessage: 'Paket tidak valid' })

  const tld = body.domainTld.toLowerCase().replace(/^\./, '')
  const tldRow = await db.query.domainTlds.findFirst({
    where: and(eq(domainTlds.tld, tld), eq(domainTlds.isActive, true))
  })
  if (!tldRow) throw createError({ statusCode: 400, statusMessage: 'TLD tidak didukung' })

  let templateId: string | null = null
  if (body.templateId) {
    const tpl = await db.query.templates.findFirst({
      where: and(eq(templates.id, body.templateId), eq(templates.isActive, true))
    })
    if (!tpl) throw createError({ statusCode: 400, statusMessage: 'Template tidak valid' })
    templateId = tpl.id
  } else if (body.templateSlug) {
    const tpl = await db.query.templates.findFirst({
      where: and(eq(templates.slug, body.templateSlug), eq(templates.isActive, true))
    })
    templateId = tpl?.id ?? null
  }

  let promo: { discountIdr?: number | null; discountPercent?: number | null } | null = null
  let promoCode: string | null = null
  if (body.promoCode?.trim()) {
    const code = body.promoCode.trim().toUpperCase()
    const row = await db.query.promoCodes.findFirst({
      where: and(eq(promoCodes.code, code), eq(promoCodes.isActive, true))
    })
    if (!row) throw createError({ statusCode: 400, statusMessage: 'Kode promo tidak valid' })
    if (row.maxUses != null && row.usedCount >= row.maxUses) {
      throw createError({ statusCode: 400, statusMessage: 'Kode promo tidak valid' })
    }
    const now = new Date()
    if (row.validFrom && row.validFrom > now) {
      throw createError({ statusCode: 400, statusMessage: 'Kode promo tidak valid' })
    }
    if (row.validUntil && row.validUntil < now) {
      throw createError({ statusCode: 400, statusMessage: 'Kode promo tidak valid' })
    }
    promo = { discountIdr: row.discountIdr, discountPercent: row.discountPercent }
    promoCode = row.code
  }

  // Annual export/umkm packages include domain; never trust client amounts.
  const totals = computeOrderTotals({
    packagePriceYearlyIdr: pkg.priceYearlyIdr,
    termYears: body.termYears,
    domainPriceYearlyIdr: 0,
    promo
  })

  const rawDomain = body.domainName.toLowerCase().replace(/\.$/, '')
  const domainName = rawDomain.includes('.')
    ? rawDomain.split('.')[0]!
    : rawDomain.replace(/[^a-z0-9-]/g, '')

  const orderId = createId('ord')
  const orderNumber = createOrderNumber()
  const paymentId = createId('pay')
  const userId = (session.user as { id?: string } | undefined)?.id ?? null

  // better-sqlite3: sync transaction — order + payment atomic
  db.transaction((tx) => {
    tx.insert(orders).values({
      id: orderId,
      orderNumber,
      userId,
      packageId: pkg.id,
      templateId,
      domainName,
      domainTld: tld,
      termYears: body.termYears,
      subtotalIdr: totals.subtotalIdr,
      discountIdr: totals.discountIdr,
      totalIdr: totals.totalIdr,
      promoCode,
      status: 'pending_payment',
      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail.toLowerCase().trim(),
      customerPhone: body.customerPhone?.trim() || null
    }).run()

    tx.insert(payments).values({
      id: paymentId,
      orderId,
      amountIdr: totals.totalIdr,
      status: 'pending'
    }).run()
  })

  return {
    data: {
      id: orderId,
      orderNumber,
      status: 'pending_payment' as const,
      subtotalIdr: totals.subtotalIdr,
      discountIdr: totals.discountIdr,
      totalIdr: totals.totalIdr,
      paymentId,
      paymentUrl: null as string | null
    }
  }
})
