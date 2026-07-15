const RESERVED = new Set(['www', 'mail', 'admin', 'root', 'api', 'mugiewdev', 'webekspor'])

export type DomainCheckResult = {
  domain: string
  available: boolean
  stub: true
  confidence: 'soft' | 'hard_unavailable'
}

export function evaluateDomainStub(name: string, tld: string): DomainCheckResult {
  const n = name.toLowerCase().replace(/[^a-z0-9-]/g, '')
  const t = tld.toLowerCase().replace(/^\./, '')
  const domain = `${n}.${t}`
  if (n.length < 3 || RESERVED.has(n)) {
    return { domain, available: false, stub: true, confidence: 'hard_unavailable' }
  }
  // Soft: not a live WHOIS — ops will confirm
  return { domain, available: true, stub: true, confidence: 'soft' }
}
