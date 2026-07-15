# Home — Enterprise Soft Glass landing

**Page:** `/` (`app/pages/index.vue`)  
**Style:** Enterprise Soft Glass (see root `DESIGN.md`)  
**Signature:** Segment hero carousel (Export / UMKM / Toko) + domain search + numbered sections (`01`–`08` display) + transparent floor price  
**Theme:** Dual — light default + full dark pairs (mesh, glass, section-index)

## Section inventory (0–14)

| # | Section | Component / surface | Notes |
|---|---------|---------------------|-------|
| 0 | PromoBanner | `PromoBanner` | Calm single line; not shouty stack |
| 1 | Glass header | layout sticky header | Glass panel, mega-feel services dropdown |
| 2 | Hero mission | `HeroDomainSearch` + mesh | Mesh + domain search + dual CTA + proof chips |
| 3 | HeroCarousel | `HeroCarousel` | UCarousel: Export / UMKM / Ecom — image + pitch + dual CTA |
| 4 | Trust logos strip | `TrustLogoStrip` | Payment / SSL / Xendit / responsive badges |
| 5 | Design collection | `HomeTemplateShowcase` | Category chips + 8 template cards + Lihat semua |
| 6 | Services | `HomeServicesBento` | Bento 2×2 premium cards + Lihat layanan |
| 7 | Domain packages | `HomeDomainPackages` | Live TLD prices from API + domain/host/SSL includes |
| 8 | Voice of users | `HomeTestimonials` | Stats strip + testimonial cards |
| 9 | Community | `HomeCommunity` | Map/avatar cluster + 4 benefits + CTA |
| 10 | Portfolio teaser | `HomePortfolioTeaser` | 3 case cards → `/portofolio` |
| 11 | Journal | `HomeBlogTeaser` | Content collection 3 posts |
| 12 | Academy teaser | `HomeAcademyTeaser` | Slim band → `/academy` |
| 13 | Final CTA | `HomeFinalCta` | Dual CTA + micro trust line |
| 14 | Footer | layout footer | Brand + blurb + columns + legal + social |

## Component tags (filename only)

`pathPrefix: false` — tags = filename, **no** `Marketing` prefix:

- `PromoBanner`
- `HeroDomainSearch`
- `HeroCarousel`
- `TrustLogoStrip`
- `HomeTemplateShowcase`
- `HomeServicesBento`
- `HomeDomainPackages`
- `HomeTestimonials`
- `HomeCommunity`
- `HomePortfolioTeaser`
- `HomeBlogTeaser`
- `HomeAcademyTeaser`
- `HomeFinalCta`
- `SectionHeading` (optional `index` prop e.g. `'01'`)

## Hero rules

- Mission band: mesh (`bg-mesh-hero`) + domain search primary conversion
- Carousel band: 3 segment slides (Export / UMKM / Ecom), pause/controls, `prefers-reduced-motion`
- Dual CTA: order primary · WhatsApp outline secondary
- Proof chips: Lucide icons + muted text; no emoji
- Keep `useSeoMeta`, `useI18n`, `useWhatsApp`, appConfig promo/price labels

## Numbered sections

- Display index via `.section-index` + `SectionHeading` `index` prop (`01`, `02`, …)
- Tabular nums, tight tracking, sky-tinted translucent color (light + dark pairs)

## Spacing & surfaces

- Vertical rhythm: `.section-y` on major bands
- Cards / CTA: `shadow-soft-*`, `ring-default`, `card-lift` where needed
- Glass sticky header: `glass-panel` with `.dark` pair
- Light mode default; never light-only hardcode

## Anti-patterns (home)

- ❌ Missing carousel when legacy has one
- ❌ Home shorter/sparser than legacy inventory
- ❌ Discount-only hero without mission
- ❌ `UPageHero`-only layout
- ❌ Anonymous / wrong auto-import tags (`Marketing*` prefix)
- ❌ Light-only glass/mesh
- ❌ Emoji icons, GSAP bloat, marketplace search-as-primary
- ❌ Hardcoded promo/price strings (use appConfig + i18n)
