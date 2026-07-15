export type ServiceType = 'export' | 'umkm' | 'ecommerce' | 'custom' | 'academy'

export interface ServicePackage {
  id: string
  slug: string
  name: string
  description?: string | null
  priceYearlyIdr: number
  features?: string[] | null
  termYears?: number | null
  serviceType?: ServiceType | string
  isActive?: boolean
  sortOrder?: number
}

export type TemplateCategory
  = 'export'
    | 'umkm'
    | 'ecommerce'
    | 'company'
    | 'agriculture'
    | 'craft'
    | 'automotive'
    | 'restaurant'
    | 'service'
    | 'custom'

export type OrderStatus
  = 'draft'
    | 'pending_payment'
    | 'paid'
    | 'provisioning'
    | 'active'
    | 'cancelled'
    | 'expired'

export type UserRole = 'customer' | 'cs' | 'admin' | 'dev'

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
