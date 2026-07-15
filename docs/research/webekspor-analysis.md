# Riset Deep: webekspor.com → MugiewDev Feature Parity

**Tanggal:** 2026-07-15  
**Sumber:** webekspor.com + halaman layanan (deep-research, multi-source verified)

## Ringkasan positioning

WebEkspor = **website builder SaaS/agency hybrid** untuk UMKM & eksportir Indonesia.  
**Bukan** marketplace multi-vendor B2B. Tidak ada RFQ, buyer registry, escrow, matching eksportir–importir.

Quote kunci: *"Buyer global mencari di Google, bukan di marketplace."*  
Revenue: paket website + renew + project fee + upsell. **Zero take-rate / komisi transaksi.**

## Arsitektur produk (4 jalur)

| Jalur | Path | Isi | Model harga |
|-------|------|-----|-------------|
| Website UMKM | `/jasa-pembuatan-website-umkm` | Company profile + katalog + form WA + legalitas + SEO lokal/GBP + admin. **Tanpa checkout penuh** | Paket tahunan domain+host |
| Website Ekspor | `/jasa-pembuatan-website-ekspor` | Profil ekspor + katalog HS code + dokumen ekspor + multi-bahasa (klaim marketing) | Paket tahunan domain+host |
| Toko Online | `/jasa-pembuatan-website-toko-online` | Cart, payment gateway, shipping, stock, variants, coupon, blog SEO | Project fee one-time + renew |
| Pesanan Khusus | `/jasa-pembuatan-website-custom` | ERP, AI, mobile, integrasi 3rd party | Custom quote |

**Upgrade path:** UMKM → Toko Online / Ekspor.

### Toko Online feature matrix

**Basic (~Rp15jt, ≤300 SKU):**
- Product mgmt (kategori, stok, variants)
- Cart/checkout + PG Indonesia
- Shipping + auto resi
- Admin dashboard
- Notif email/WA
- Coupon/promo
- Blog & SEO, SSL, responsive

**Standard (~Rp25jt, ≤1000+ SKU):** Basic + Membership/Loyalty, Multi-warehouse, Custom shipping, Tier/wholesale pricing, Custom product, Integrasi stock marketplace.

**Renew year-2+:** Basic ~Rp4.047.000 / Standard ~Rp5.047.000.

## Pricing (marketing, 2026)

- Entry promo: Rp97.000/thn (strike Rp245.000)
- UMKM: ~Rp100rb/bln, diskon tahunan s.d. 50%
- Floor domain+host: **~Rp1 jutaan/tahun** (promo TLD ~1.2–1.5jt)
- Promo code: **WEBSITEJUARA −Rp500.000**
- Term: 1/2/3 tahun (domain, host, SSL, komunitas ikut)

## Payment & SLA

- Methods (WebEkspor reference): VA (BCA, Mandiri, BRI, BNI, Permata), OVO/DANA/LinkAja, QRIS, card, Paylater
- Unpaid auto-cancel: **2×24 jam**
- Live setelah bayar: **1–2×24 jam kerja**
- **Payment provider: QrisVIP QRIS-only (2026-07-15)** — pivot from Xendit; MugiewDev v1 = QRIS generate + poll Check Status V2 + webhook `/api/webhooks/qrisvip`

## Flow user

```
Browse /templates (kategori: Produk Ekspor, Agrikultur, Craft, Company, Otomotif, Restaurant, Service)
  → CTA "Buat Website" / Beli
  → /order/choose-domain
  → Wizard: Domain → Template → Data Diri → Paket & Bayar
  → Payment QrisVIP QRIS
  → Provisioning (team + dashboard)
  → panel.webekspor.com (login)
  → Komunitas auto-invite setelah site publish
```

**Alt CTA:** WhatsApp `wa.me/6281280080275`

## Membership / komunitas

- **Gratis**, auto-aktif setelah paket website dibeli & site publish
- Syarat: bikin website di platform
- Benefit: grup diskusi, kelas gratis, promo member, dana talangan ekspor (partner), support admin, jaringan eksportir
- Bukan freemium terpisah — **bundled retention**

## Akademi

- Track pemula (12 modul): mindset, legalitas, HS code, dokumen, logistik, bayar, cari buyer
- Lanjutan: brand, SEO, funnel, scale (member aktif)
- Progress + kuis + sertifikat
- Payment (WebEkspor claim): Xendit-class (~Rp989rb/thn; status "coming soon" di beberapa section). MugiewDev: QrisVIP when academy paid ships.

## SEO (confirmed vs marketing-only)

**Confirmed:**
- SEO lokal + Google Business Profile (UMKM)
- Export value prop: katalog + dokumen untuk discoverability Google
- Toko Online: blog & SEO

**Partial / tidak unanime di primary pages:**
- Day-one meta/sitemap/schema/page-speed stack detail
- Multi-language matrix penuh
- Field inventory HS/MOQ/packaging/sample form

→ MugiewDev **harus** implement SEO stack lengkap (Nuxt SEO modules) sebagai keunggulan.

## Struktur halaman public (parity target)

| Route | Tujuan |
|-------|--------|
| `/` | Hero, layanan, social proof, CTA |
| `/templates` | Katalog design + filter kategori |
| `/templates/:slug` | Detail template |
| `/jasa-pembuatan-website-ekspor` | Landing layanan ekspor |
| `/jasa-pembuatan-website-umkm` | Landing UMKM |
| `/jasa-pembuatan-website-toko-online` | Landing ecom + pricing project |
| `/jasa-pembuatan-website-custom` | Landing custom |
| `/order/choose-domain` | Wizard order step 1 |
| `/order/*` | Template, data diri, paket, bayar |
| `/academy` | Akademi ekspor |
| `/komunitas` | Benefit komunitas |
| `/portofolio` | Case studies |
| `/tutorial` | Tutorial |
| `/faq` | FAQ |
| `/blog`, `/blog/*` | Content marketing |
| `/login` | Auth panel |
| `/panel/*` | Dashboard customer |
| Legal: syarat, privasi, refund | Compliance |

## Model bisnis MugiewDev (mirror)

1. **Core:** paket website tahunan (domain+host+SSL+email+template)
2. **Project:** Toko Online / Custom one-time
3. **Renewal:** tahun ke-2+
4. **Upsell:** editing, template premium, multi-bahasa, extra email
5. **Akademi:** membership tahunan (opsional bundle)
6. **Partner:** dana talangan (referral, bukan balance sheet)
7. **Tidak:** komisi transaksi marketplace

## Implikasi tech MugiewDev

| Area | Keputusan |
|------|-----------|
| App type | Multi-SKU site-builder platform + ecom admin + community layer |
| Bukan | Exporter–importer matching marketplace |
| Auth | Session cookie (`nuxt-auth-utils`) + panel |
| Payment | **QrisVIP QRIS-only (2026-07-15)** — not Xendit |
| Content | Nuxt Content (blog, FAQ, tutorial) |
| Catalog | Drizzle schema: templates, packages, orders, sites |
| i18n | ID default + EN |
| SEO | sitemap, robots, og-image, routeRules SWR/prerender |
| Provisioning | Order paid → site record → (manual/ops v1) |

## Feature backlog prioritas (parity)

### P0 — Foundation (setup done / next agents)
- [x] Nuxt 4 + Nuxt UI scaffold
- [x] Design system Soft UI Evolution
- [x] i18n ID/EN
- [x] Schema DB core
- [x] Auth skeleton
- [x] Seed templates + packages (+ promo WEBSITEJUARA, domain TLDs)
- [x] Order wizard (domain → template → data → bayar)
- [x] QrisVIP QRIS + status poll + webhook `/api/webhooks/qrisvip` (was Xendit; pivoted 2026-07-15)
- [x] Panel: sites, orders

### P1 — Marketing parity
- [x] Landing 4 layanan
- [x] Templates catalog + detail + filter
- [x] FAQ / Blog / Tutorial (Content)
- [x] Komunitas + Academy pages
- [x] Portofolio
- [x] Promo code engine

### P2 — Product depth
- [ ] Ecom project intake form
- [ ] Academy modules + progress
- [x] Inquiry inbox di panel
- [ ] Domain availability check (registrar API)
- [ ] Multi-year package

### P3 — Differentiation
- [ ] Day-one SEO pack per site (schema, sitemap, meta)
- [ ] Multi-language site builder
- [ ] HS code catalog fields
- [ ] Loyalty / wholesale (Standard ecom)
