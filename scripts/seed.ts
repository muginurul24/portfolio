/**
 * Seed initial catalog data.
 * Run after `pnpm db:push`:
 *   pnpm exec tsx scripts/seed.ts
 */
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import * as schema from '../server/database/schema'

const path = process.env.NUXT_DATABASE_URL?.replace('file:', '') || './.data/mugiew.sqlite'
mkdirSync(dirname(path), { recursive: true })

const sqlite = new Database(path)
sqlite.pragma('journal_mode = WAL')
const db = drizzle(sqlite, { schema })

const now = new Date()

async function main() {
  await db.insert(schema.promoCodes).values({
    id: 'promo_websitejuara',
    code: 'WEBSITEJUARA',
    discountIdr: 500_000,
    isActive: true
  }).onConflictDoNothing()

  await db.insert(schema.domainTlds).values([
    { id: 'tld_com', tld: 'com', priceYearlyIdr: 1_247_000, promoPriceYearlyIdr: 1_247_000 },
    { id: 'tld_coid', tld: 'co.id', priceYearlyIdr: 1_477_000, promoPriceYearlyIdr: 1_477_000 },
    { id: 'tld_id', tld: 'id', priceYearlyIdr: 1_466_000, promoPriceYearlyIdr: 1_466_000 },
    { id: 'tld_net', tld: 'net', priceYearlyIdr: 1_300_000 },
    { id: 'tld_org', tld: 'org', priceYearlyIdr: 1_300_000 }
  ]).onConflictDoNothing()

  await db.insert(schema.packages).values([
    {
      id: 'pkg_export_1y',
      slug: 'website-ekspor-1y',
      name: 'Website Ekspor 1 Tahun',
      serviceType: 'export',
      priceYearlyIdr: 1_247_000,
      features: ['Domain', 'Hosting unlimited', 'SSL', 'Email bisnis', 'Template ekspor', 'Komunitas'],
      termYears: 1
    },
    {
      id: 'pkg_umkm_1y',
      slug: 'website-umkm-1y',
      name: 'Website UMKM 1 Tahun',
      serviceType: 'umkm',
      priceYearlyIdr: 1_247_000,
      features: ['Domain', 'Hosting', 'SSL', 'SEO lokal', 'Form WA', 'Komunitas'],
      termYears: 1
    },
    {
      id: 'pkg_ecom_basic',
      slug: 'toko-online-basic',
      name: 'Toko Online Basic',
      serviceType: 'ecommerce',
      priceYearlyIdr: 15_000_000,
      features: ['≤300 SKU', 'Cart', 'Payment gateway', 'Shipping', 'Admin'],
      termYears: 1
    }
  ]).onConflictDoNothing()

  const tpls = [
    ['coconut-briquettes', 'Coconut Briquettes Export', 'export'],
    ['spice-exporter', 'Spice Exporter Pro', 'export'],
    ['seafood-export', 'Seafood Export', 'export'],
    ['furniture-rattan', 'Furniture & Rotan', 'export'],
    ['umkm-local', 'UMKM Lokal SEO', 'umkm'],
    ['craft-gallery', 'Craft Gallery', 'craft'],
    ['company-profile', 'Company Profile', 'company'],
    ['toko-online-basic', 'Toko Online Basic', 'ecommerce']
  ] as const

  await db.insert(schema.templates).values(
    tpls.map(([slug, name, category], i) => ({
      id: `tpl_${slug}`,
      slug,
      name,
      category,
      isFeatured: i < 3,
      sortOrder: i,
      createdAt: now,
      updatedAt: now
    }))
  ).onConflictDoNothing()

  await db.insert(schema.testimonials).values([
    {
      id: 'tm_1',
      name: 'Husein Izza',
      role: 'Eksportir',
      content: 'Admin cepat, template bisa diganti, harga masuk akal.',
      rating: 5,
      isFeatured: true,
      sortOrder: 0
    },
    {
      id: 'tm_2',
      name: 'Qori Framana',
      role: 'UMKM',
      content: 'Komunitas aktif dan seminar ekspor membantu banget.',
      rating: 5,
      isFeatured: true,
      sortOrder: 1
    }
  ]).onConflictDoNothing()

  console.log('Seed OK →', path)
  sqlite.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
