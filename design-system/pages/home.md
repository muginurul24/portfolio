# Home — Soft Glass Trust landing

**Page:** `/` (`app/pages/index.vue`)  
**Style:** Soft Glass Trust (see root `DESIGN.md`)  
**Signature:** Hero domain search on soft mesh + transparent price badge + dual CTA

## Section order

1. **Hero** — `bg-mesh-hero` + `section-y`
   - Price floor badge (`UBadge` subtle primary)
   - Display headline (`.text-display`)
   - Subtitle
   - **`HeroDomainSearch`** (signature conversion control)
   - Dual CTA: order primary · WhatsApp outline secondary
   - Stats chips (members / rating / sales-up)
2. **`HomeTemplateShowcase`** — template proof / gallery tease
3. **`HomeServicesBento`** — services grid (export, UMKM, ecom, custom, academy, community)
4. **`HomeSteps`** — 3-step how-it-works
5. **`HomePricingStrip`** — transparent packages / promo floor
6. **`HomeTestimonials`** — social proof
7. **`HomeCommunity`** — community band
8. **`HomeBlogTeaser`** — content tease
9. **Final CTA** — `UPageCTA` in `section-y` container, soft shadow + ring
10. Footer via layout (not page-local)

## Hero rules

- Centered max-width stack (`max-w-3xl mx-auto text-center`)
- No bare `UPageHero` — custom mesh section only
- Domain search is primary conversion path; buttons reinforce order + consult
- Stats use Lucide icons + muted text; no emoji
- Keep `useSeoMeta`, `useI18n`, `useWhatsApp`, appConfig promo/price labels

## Spacing & surfaces

- Vertical rhythm: `.section-y` on hero + final CTA (inner sections own padding)
- Cards / CTA: `shadow-soft-*`, ring-default where needed
- Light mode default; mesh friendly on `#F8FAFC`

## Anti-patterns (home)

- ❌ `UPageHero`-only layout
- ❌ Single generic `UPageSection` features list replacing Home* components
- ❌ Missing domain search in hero
- ❌ Hardcoded promo/price strings (use appConfig + i18n)
