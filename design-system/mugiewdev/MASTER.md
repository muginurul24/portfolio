# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** MugiewDev  
**Generated:** 2026-07-15 11:32:28  
**Updated:** 2026-07-15 — Enterprise Soft Glass  
**Category:** SaaS (General)  
**Style:** Enterprise Soft Glass  
**Design Dials:** Variance 7/10 | Motion 6/10 | Density 5/10  

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#0F172A` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#334155` | `--color-secondary` |
| Accent/CTA | `#0369A1` | `--color-accent` |
| Background | `#F8FAFC` | `--color-background` |
| Foreground | `#020617` | `--color-foreground` |
| Muted | `#E8ECF1` | `--color-muted` |
| Border | `#E2E8F0` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#0F172A` | `--color-ring` |

**Color Notes:** Professional navy headings + sky CTA (`#0369A1`). Soft mesh + glass with **light + dark** pairs (`.dark .bg-mesh-hero`, `.dark .glass-panel`, `.dark .section-index`). Prefer Nuxt UI semantic surfaces over raw hex. **No AI purple** gradients or playful candy palettes.

### Typography

- **Heading Font:** Plus Jakarta Sans
- **Body Font:** Plus Jakarta Sans
- **Mood:** enterprise, calm authority, modern, clean, professional, trustworthy
- **Google Fonts:** [Plus Jakarta Sans](https://fonts.google.com/share?selection.family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800)
- **Display utility:** `.text-display` — letter-spacing −0.03em, weight 700, line-height 1.1
- **Section index:** `.section-index` — tabular-nums, −0.04em, weight 700, sky-tinted

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
```

### Spacing Variables

*Density: 5/10 — Balanced enterprise (complete sections, not sparse)*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

Section utility: `.section-y` → `4rem` / `5.5rem` (md+).

### Shadow Depths

Richer layered soft shadows (tokens in `app/assets/css/main.css`):

| Level | Token | Usage |
|-------|-------|-------|
| soft-sm | `--shadow-soft-sm` | Subtle lift |
| soft-md | `--shadow-soft-md` | Cards, buttons |
| soft-lg | `--shadow-soft-lg` | Hover cards, dropdowns |
| soft-xl | `--shadow-soft-xl` | Modals, floating WA |
| glow-sky | `--shadow-glow-sky` | CTA emphasis |

### Mesh, glass & section index

| Class | Usage |
|-------|-------|
| `bg-mesh-hero` | Hero / marketing top bands (light + dark) |
| `glass-panel` | Frosted sticky header / light panels (light + dark) |
| `section-index` | Numbered section display `01`… (light + dark) |
| `card-lift` | Hover lift (respects reduced-motion) |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #0369A1;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #0F172A;
  border: 2px solid #0F172A;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

Nuxt UI: `button.slots.base` includes `cursor-pointer font-semibold`.

### Cards

```css
.card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-soft-md);
  ring: 1px solid rgb(226 232 240 / 0.8);
  transition: box-shadow 200ms ease, transform 200ms ease;
}

.card:hover {
  box-shadow: var(--shadow-soft-lg);
  transform: translateY(-2px);
}
```

Nuxt UI card root: `shadow-soft-md ring-1 ring-default/80 bg-default`.

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #0369A1;
  outline: none;
  box-shadow: 0 0 0 3px rgb(3 105 161 / 0.2);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-soft-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Enterprise Soft Glass

**Keywords:** Soft glass, trust navy, sky CTA, mesh hero, segment carousel, numbered sections, layered soft shadows, dual theme, calm authority

**Best For:** UMKM website builder, B2B SaaS marketing, trust-led conversion, enterprise-complete landing inventory

**Key Effects:** Soft shadows, mesh backgrounds, glass panels (dual theme), section-index, card-lift, focus visible, WCAG AA

### Page Pattern

**Pattern Name:** Trust + Authority + Enterprise Gateway (Website Builder)

- **Conversion Strategy:** Segment carousel + hero domain search + transparent price floor + dual CTA (order / WA).
- **CTA Placement:** Hero domain search + carousel dual CTAs + primary order CTA; sticky header secondary.
- **Section Order:** 0 Promo → 1 Header → 2 Hero mission → 3 HeroCarousel → 4 Trust logos → 5 Templates → 6 Services → 7 Domain packages → 8 Testimonials → 9 Community → 10 Portfolio → 11 Journal → 12 Academy → 13 Final CTA → 14 Footer

---

## Motion

**Dials:** Motion 6/10 — purposeful micro-interactions + controlled carousel

- Page transition: opacity + 4px translateY, 200ms (CSS, not GSAP overlay by default)
- Micro: 150–300ms ease
- Carousel: autoplay optional with pause/controls
- Respect `prefers-reduced-motion`
- Avoid decorative-only motion

---

## Anti-Patterns (Do NOT Use)

- ❌ Playful / toy UI, cartoon illustration overload
- ❌ AI-slop purple / violet gradient defaults
- ❌ Cheap promo spam (banner stacks, fake urgency countdown)
- ❌ Missing carousel or sparse home vs full inventory
- ❌ Emoji icons (use `i-lucide-*` / `i-simple-icons-*`)
- ❌ Gray-on-gray low contrast
- ❌ Dark mode by default
- ❌ Light-only glass/mesh without `.dark` pairs
- ❌ Excessive animation / GSAP bloat on marketing
- ❌ Marketplace search-as-primary product framing
- ❌ Missing `cursor:pointer` on clickables
- ❌ Layout-shifting hover scales
- ❌ Instant state changes without transition
- ❌ Invisible focus states
- ❌ Wrong component tags (`Marketing*` prefix)

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Lucide / Simple Icons)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] Mesh/glass/section-index have light + dark pairs
- [ ] Home ships full 0–14 section inventory when building `/`
