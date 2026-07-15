import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ─── Users & Auth ──────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  phone: text('phone'),
  role: text('role', { enum: ['customer', 'admin', 'cs', 'dev'] }).notNull().default('customer'),
  emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, table => [
  index('users_email_idx').on(table.email)
])

// ─── Templates ─────────────────────────────────────────
export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category', {
    enum: ['export', 'umkm', 'ecommerce', 'company', 'agriculture', 'craft', 'automotive', 'restaurant', 'service', 'custom']
  }).notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  thumbnailUrl: text('thumbnail_url'),
  previewUrl: text('preview_url'),
  demoUrl: text('demo_url'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, table => [
  index('templates_category_idx').on(table.category),
  index('templates_slug_idx').on(table.slug)
])

// ─── Packages (pricing) ────────────────────────────────
export const packages = sqliteTable('packages', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  serviceType: text('service_type', {
    enum: ['export', 'umkm', 'ecommerce', 'custom', 'academy']
  }).notNull(),
  priceYearlyIdr: integer('price_yearly_idr').notNull(),
  priceMonthlyIdr: integer('price_monthly_idr'),
  features: text('features', { mode: 'json' }).$type<string[]>().default([]),
  includesDomain: integer('includes_domain', { mode: 'boolean' }).notNull().default(true),
  includesHosting: integer('includes_hosting', { mode: 'boolean' }).notNull().default(true),
  includesSsl: integer('includes_ssl', { mode: 'boolean' }).notNull().default(true),
  includesBizEmail: integer('includes_biz_email', { mode: 'boolean' }).notNull().default(true),
  termYears: integer('term_years').notNull().default(1),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

// ─── Domain TLD pricing ────────────────────────────────
export const domainTlds = sqliteTable('domain_tlds', {
  id: text('id').primaryKey(),
  tld: text('tld').notNull().unique(), // com, id, co.id
  priceYearlyIdr: integer('price_yearly_idr').notNull(),
  promoPriceYearlyIdr: integer('promo_price_yearly_idr'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
})

// ─── Orders ────────────────────────────────────────────
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').references(() => users.id),
  packageId: text('package_id').references(() => packages.id),
  templateId: text('template_id').references(() => templates.id),
  domainName: text('domain_name'),
  domainTld: text('domain_tld'),
  termYears: integer('term_years').notNull().default(1),
  subtotalIdr: integer('subtotal_idr').notNull(),
  discountIdr: integer('discount_idr').notNull().default(0),
  totalIdr: integer('total_idr').notNull(),
  promoCode: text('promo_code'),
  status: text('status', {
    enum: ['draft', 'pending_payment', 'paid', 'provisioning', 'active', 'cancelled', 'expired']
  }).notNull().default('draft'),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  notes: text('notes'),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  activatedAt: integer('activated_at', { mode: 'timestamp' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, table => [
  index('orders_user_idx').on(table.userId),
  index('orders_status_idx').on(table.status),
  index('orders_number_idx').on(table.orderNumber)
])

// ─── Payments ──────────────────────────────────────────
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  provider: text('provider', { enum: ['qrisvip', 'xendit'] }).notNull().default('qrisvip'),
  providerRef: text('provider_ref'), // QrisVIP trx_id
  method: text('method'), // qris
  amountIdr: integer('amount_idr').notNull(),
  status: text('status', {
    enum: ['pending', 'paid', 'failed', 'expired', 'refunded']
  }).notNull().default('pending'),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  rawPayload: text('raw_payload', { mode: 'json' }),
  qrisPayload: text('qris_payload'), // EMV QR string for display
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, table => [
  index('payments_order_idx').on(table.orderId),
  index('payments_provider_ref_idx').on(table.providerRef)
])

// ─── Sites (provisioned websites) ──────────────────────
export const sites = sqliteTable('sites', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  orderId: text('order_id').references(() => orders.id),
  templateId: text('template_id').references(() => templates.id),
  domain: text('domain').notNull().unique(),
  status: text('status', {
    enum: ['provisioning', 'active', 'suspended', 'expired']
  }).notNull().default('provisioning'),
  adminUrl: text('admin_url'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, table => [
  index('sites_user_idx').on(table.userId)
])

// ─── Academy ───────────────────────────────────────────
export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  level: text('level', { enum: ['beginner', 'advanced'] }).notNull().default('beginner'),
  moduleCount: integer('module_count').notNull().default(0),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export const courseModules = sqliteTable('course_modules', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().references(() => courses.id),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  contentMd: text('content_md'),
  videoUrl: text('video_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  durationMinutes: integer('duration_minutes'),
  hasQuiz: integer('has_quiz', { mode: 'boolean' }).notNull().default(false)
}, table => [
  index('course_modules_course_idx').on(table.courseId)
])

export const courseProgress = sqliteTable('course_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  moduleId: text('module_id').notNull().references(() => courseModules.id),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  quizScore: real('quiz_score'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, table => [
  index('course_progress_user_idx').on(table.userId)
])

// ─── Inquiries (export lead forms on customer sites) ───
export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(),
  siteId: text('site_id').references(() => sites.id),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  message: text('message'),
  productInterest: text('product_interest'),
  source: text('source').default('website'),
  status: text('status', {
    enum: ['new', 'contacted', 'quoted', 'won', 'lost']
  }).notNull().default('new'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
}, table => [
  index('inquiries_site_idx').on(table.siteId)
])

// ─── Promo codes ───────────────────────────────────────
export const promoCodes = sqliteTable('promo_codes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountIdr: integer('discount_idr'),
  discountPercent: integer('discount_percent'),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').notNull().default(0),
  validFrom: integer('valid_from', { mode: 'timestamp' }),
  validUntil: integer('valid_until', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
})

// ─── Testimonials ──────────────────────────────────────
export const testimonials = sqliteTable('testimonials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role'),
  company: text('company'),
  avatarUrl: text('avatar_url'),
  content: text('content').notNull(),
  rating: integer('rating').notNull().default(5),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
})

export type User = typeof users.$inferSelect
export type Template = typeof templates.$inferSelect
export type Package = typeof packages.$inferSelect
export type Order = typeof orders.$inferSelect
export type Payment = typeof payments.$inferSelect
export type Site = typeof sites.$inferSelect
