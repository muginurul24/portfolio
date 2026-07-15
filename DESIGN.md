# DESIGN.md — MugiewDev

**Style:** Soft UI Evolution  
**Product:** Website-builder platform untuk UMKM & eksportir Indonesia  
**Tone:** Profesional, dapat dipercaya, approachable — bukan marketplace flashy  

## Signature

**Satu elemen yang diingat:** Hero thesis *"Bikin Website · Tanpa Ribet"* + harga transparan + CTA domain search / order. Trust navy + sky CTA. Soft depth (bukan neumorphism kental).

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
- Default color mode: **light** (dark supported, not default)

## Typography

- **Family:** Plus Jakarta Sans (300–700) via `@nuxt/fonts`
- **Body base:** 16px, line-height 1.5–1.75
- **Headings:** semibold/bold, tracking-tight
- **Prices:** `tabular-nums`

## Spacing (8pt)

`4 / 8 / 16 / 24 / 32 / 48 / 64`

## Shadows (Soft UI)

```
soft-sm  — subtle lift
soft-md  — cards
soft-lg  — hover cards, dropdowns
soft-xl  — modals, floating WA
```

Defined in `app/assets/css/main.css` as `--shadow-soft-*`.

## Layout patterns

### Marketing pages
1. Sticky header (blur, border-b)
2. Hero (thesis + dual CTA)
3. Proof strip (stats)
4. Features / services grid
5. How it works (3 steps numbered)
6. Testimonials (when data ready)
7. Pricing / packages
8. Final CTA
9. Footer columns

### Order wizard
Progress indicator · one primary action per step · back always available · promo code on checkout.

### Panel
Sidebar nav (desktop) · top bar mobile · dense cards · tabular stats.

## Motion

- Micro: 150–300ms ease
- Page transition: opacity + 4px translateY, 200ms
- Respect `prefers-reduced-motion`
- No decorative-only animation; max 1–2 animated moments per view

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

## Landing conversion (Trust + Authority)

- Hero credibility + price floor
- Proof: 12k+ UMKM, rating, growth claim
- Transparent pricing, promo code visible
- Low-friction WA consult secondary CTA
- Primary CTA: order / domain

## Anti-patterns

- ❌ Dark mode default
- ❌ Excessive animation / GSAP bloat on marketing unless justified
- ❌ Marketplace search-as-primary (kita jual website, bukan listing barang)
- ❌ Emoji icons
- ❌ Hover-only interactions
- ❌ Layout-shifting hover scales
- ❌ Gray-on-gray low contrast
- ❌ Hardcoded hex in components — use tokens / Nuxt UI semantic classes

## Page overrides

Hierarchical:
1. `design-system/pages/<page>.md` if exists
2. Else this file + `design-system/mugiewdev/MASTER.md` (generated)

When implementing a page, agents MUST read this file first.
