export interface ComputeOrderInput {
  packagePriceYearlyIdr: number
  termYears: number
  domainPriceYearlyIdr: number
  promo?: { discountIdr?: number | null; discountPercent?: number | null } | null
}

export function computeOrderTotals(input: ComputeOrderInput) {
  const term = Math.min(3, Math.max(1, Math.floor(input.termYears || 1)))
  const subtotalIdr = (input.packagePriceYearlyIdr + input.domainPriceYearlyIdr) * term

  let discountIdr = 0
  const promo = input.promo
  if (promo) {
    if (promo.discountIdr != null && promo.discountIdr > 0) {
      discountIdr = Math.floor(promo.discountIdr)
    } else if (promo.discountPercent != null && promo.discountPercent > 0) {
      discountIdr = Math.floor((subtotalIdr * promo.discountPercent) / 100)
    }
  }

  if (discountIdr > subtotalIdr) discountIdr = subtotalIdr
  const totalIdr = Math.max(0, subtotalIdr - discountIdr)
  return { subtotalIdr, discountIdr, totalIdr }
}
