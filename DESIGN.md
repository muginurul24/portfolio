# DESIGN.md — MugiewDev

**Style:** Enterprise Soft Glass  
**Product:** Website-builder platform untuk UMKM & eksportir Indonesia  
**Tone:** Profesional, calm authority, approachable — bukan marketplace flashy / discount spam  

## Signature

**Elemen yang diingat:** Segment hero **carousel** (Export / UMKM / Toko) + **domain search** on soft mesh (`bg-mesh-hero`) + **numbered sections** (`01`–`08` via `.section-index`) + harga transparan. Trust navy + sky CTA. Soft depth + dual-theme glass panels.

## Color tokens

| Role | Hex | Notes |
|------|-----|-------|
| Primary navy | `#0F172A` | Heading, focus ring, brand text |
| Secondary | `#334155` | Secondary text |
| Accent / CTA | `#0369A1` | Primary buttons (sky-600) |
| Background | `#F8FAFC` | Page bg light |
| Foreground | `#020617` | Body |
| Muted surface | `#E8ECF1` | Chips, muted cards |
| Border | `#E2E8F0` | Dividers |
| Destructive | `#DC2626` | Errors, danger |
| Success | green scale | WA, success states |

**Nuxt UI mapping** (`app.config.ts`):
- `primary: 'sky'`
- `neutral: 'slate'`
- Color mode: default **light**, full **dark** supported (`classSuffix: ''` → class `dark` on `<html>`, storage `mugiew-color-mode`)
- Surfaces use semantic tokens (`bg-default`, `text-highlighted`, `text-muted`, `ring-default`, `bg-elevated`)
- Custom chrome (`.bg-mesh-hero`, `.glass-panel`, `.section-index`, soft shadows) has **paired light + dark** rules in `main.css`
- Toggle: `UColorModeButton` in header; never ship light-only hardcodes

## Typography

- **Family:** Plus Jakarta Sans (300–800 OK via `@nuxt/fonts`)
- **Body base:** 16px, line-height 1.5–1.75
- **Headings:** semibold/bold, tracking-tight; display via `.text-display` (−0.03em, weight 700, lh 1.1)
- **Section index:** `.section-index` — tabular-nums, −0.04em tracking, weight 700, sky-tinted translucent
- **Prices:** `tabular-nums`

## Spacing (8pt)

`4 / 8 / 16 / 24 / 32 / 48 / 64`

Section vertical rhythm: `.section-y` → `4rem` / `5.5rem` (md+).

## Shadows (Soft UI — richer layered)

```
soft-sm   — subtle lift
soft-md   — cards
soft-lg   — hover cards, dropdowns
soft-xl   — modals, floating WA
glow-sky  — CTA / primary emphasis ring + glow
```

Defined in `app/assets/css/main.css` as `--shadow-soft-*` and `--shadow-glow-sky`.

## Mesh, glass & section utilities

| Class | Use |
|-------|-----|
| `bg-mesh-hero` | Hero / top marketing bands — soft sky mesh (light + dark pairs) |
| `glass-panel` | Frosted surfaces (header sticky, overlays) — light + dark pairs |
| `section-index` | Numbered section display (`01`…) — light + dark sky tint |
| `card-lift` | Card hover: soft-lg + −2px translateY; reduced-motion safe |
| `section-y` | Consistent section padding-block |
| `text-display` | Large marketing headlines |

## Layout patterns

### Marketing pages — home section order (0–14)

| # | Section | Premium note |
|---|---------|--------------|
| 0 | PromoBanner | Calm single line |
| 1 | Glass header | Sticky glass, services dropdown |
| 2 | Hero mission | Mesh + domain search + dual CTA + proof chips |
| 3 | **HeroCarousel** | UCarousel Export / UMKM / Ecom |
| 4 | Trust logos strip | Payment / SSL / Xendit badges |
| 5 | Design collection | Chips + 8 templates + Lihat semua |
| 6 | Services | Bento 2×2 + Lihat layanan |
| 7 | Domain packages | Live TLD API prices |
| 8 | Voice of users | Stats + testimonial cards |
| 9 | Community | Cluster + benefits + CTA |
| 10 | Portfolio teaser | 3 cases → `/portofolio` |
| 11 | Journal | 3 blog posts |
| 12 | Academy teaser | Slim band → `/academy` |
| 13 | Final CTA | Dual CTA + micro trust |
| 14 | Footer | Brand + columns + legal + social |

Component tags = **filename only** (no `Marketing` prefix): `HeroCarousel`, `HeroDomainSearch`, `SectionHeading`, etc.

### Order wizard
Progress indicator · one primary action per step · back always available · promo code on checkout.

### Panel
Sidebar nav (desktop) · top bar mobile · dense cards · tabular stats.

## Motion

- Micro: 150–300ms ease
- Page transition: opacity + 4px translateY, 200ms
- Carousel: pause/controls; respect `prefers-reduced-motion`
- No decorative-only animation; max 1–2 animated moments per view beyond carousel

## Icons

- **Lucide** (`i-lucide-*`) for UI
- **Simple Icons** (`i-simple-icons-*`) for brands (WhatsApp, etc.)
- **Never** emoji as structural icons

## Accessibility (non-negotiable)

- Contrast body ≥ 4.5:1
- Focus visible 2px sky-600
- Touch targets ≥ 44px
- Skip link to `#main`
- Labels on all form fields (not placeholder-only)
- Loading buttons disabled + spinner
- Color not sole meaning
- Carousel: pause + controls

## Landing conversion (Trust + Authority + Enterprise Gateway)

- Hero credibility + price floor + domain search
- Segment carousel for Export / UMKM / Ecom paths
- Proof: 12k+ UMKM, rating, growth claim, trust logos
- Transparent pricing, promo code visible
- Low-friction WA consult secondary CTA
- Primary CTA: order / domain search
- Numbered section system for calm enterprise scanability

## Anti-patterns

- ❌ Missing carousel when legacy has one
- ❌ Home shorter/sparser than full 0–14 inventory
- ❌ Light-only hardcode that breaks dark (`bg-white`, fixed mesh without `.dark` pair)
- ❌ Pure invert “night mode” — use desaturated surfaces + sky accent
- ❌ Excessive animation / GSAP bloat on marketing unless justified
- ❌ Marketplace search-as-primary (kita jual website, bukan listing barang)
- ❌ Emoji icons
- ❌ Cheap promo spam (banner stack, countdown gimmicks)
- ❌ Playful / toy UI; AI-slop purple gradients
- ❌ Hover-only interactions
- ❌ Layout-shifting hover scales
- ❌ Gray-on-gray low contrast
- ❌ Hardcoded hex in components — use tokens / Nuxt UI semantic classes
- ❌ Wrong auto-import tags (`Marketing*` prefix)

## Page overrides

Hierarchical:
1. `design-system/pages/<page>.md` if exists
2. Else this file + `design-system/mugiewdev/MASTER.md` (generated)

When implementing a page, agents MUST read this file first.
