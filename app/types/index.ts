export type ServiceType = 'export' | 'umkm' | 'ecommerce' | 'custom' | 'academy'

export type TemplateCategory =
  | 'export'
  | 'umkm'
  | 'ecommerce'
  | 'company'
  | 'agriculture'
  | 'craft'
  | 'automotive'
  | 'restaurant'
  | 'service'
  | 'custom'

export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'provisioning'
  | 'active'
  | 'cancelled'
  | 'expired'

export type UserRole = 'customer' | 'admin' | 'cs'

export interface NavItem {
  label: string
  to?: string
  icon?: string
  children?: NavItem[]
}

export interface MoneyIdr {
  amount: number
  currency: 'IDR'
}

export interface OrderDraft {
  packageId?: string
  templateId?: string
  domainName?: string
  domainTld?: string
  termYears: number
  promoCode?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}
