/** Format IDR without decimals. Locale-aware via Intl. */
export function formatIdr(amount: number, locale = 'id-ID'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount)
}

/** Compact IDR: Rp1,2jt */
export function formatIdrCompact(amount: number): string {
  if (amount >= 1_000_000) {
    const jt = amount / 1_000_000
    return `Rp${jt % 1 === 0 ? jt : jt.toFixed(1).replace('.', ',')}jt`
  }
  if (amount >= 1_000) {
    return `Rp${Math.round(amount / 1_000)}rb`
  }
  return formatIdr(amount)
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Allow only plain hostname-like strings for external https:// links.
 * Rejects credentials, paths, schemes, and invalid labels.
 */
export function isSafeHttpHost(domain: string): boolean {
  if (typeof domain !== 'string') return false
  const host = domain.trim().toLowerCase()
  if (!host || host.length > 253) return false
  if (host.includes('@') || host.includes('/') || host.includes('\\') || host.includes(':')) {
    return false
  }
  if (host.startsWith('.') || host.endsWith('.') || host.includes('..')) return false
  const labels = host.split('.')
  if (labels.length < 1) return false
  return labels.every((label) => {
    if (!label || label.length > 63) return false
    // alnum + hyphen, no leading/trailing hyphen
    return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label) || /^[a-z0-9]$/.test(label)
  })
}
