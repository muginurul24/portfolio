import { Xendit } from 'xendit-node'

export function getXenditClient() {
  const config = useRuntimeConfig()
  const secret = config.xenditSecretKey as string
  if (!secret) return null
  return new Xendit({ secretKey: secret })
}

export async function createXenditInvoice(input: {
  externalId: string
  amount: number
  email: string
  description: string
  successRedirectUrl: string
  failureRedirectUrl: string
}) {
  const client = getXenditClient()
  if (!client) return null

  const invoice = await client.Invoice.createInvoice({
    data: {
      externalId: input.externalId,
      amount: input.amount,
      payerEmail: input.email,
      description: input.description,
      successRedirectUrl: input.successRedirectUrl,
      failureRedirectUrl: input.failureRedirectUrl,
      currency: 'IDR'
    }
  })
  return {
    id: String(invoice.id || ''),
    invoiceUrl: String(invoice.invoiceUrl || '')
  }
}
