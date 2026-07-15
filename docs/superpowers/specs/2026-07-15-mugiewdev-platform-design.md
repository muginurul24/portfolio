# MugiewDev Platform Design Spec

**Date:** 2026-07-15  
**Status:** Approved by owner mandate (full agent autonomy on stack + scaffold)  
**Stack:** Nuxt 4 + Nuxt UI 4 + Drizzle + Xendit + Resend  

## Problem

UMKM & exporters need professional web presence (Google-discoverable) without building from scratch or relying on marketplaces that take commission.

## Solution

Annual website packages (template + domain + hosting + SSL + email) with optional ecom project builds, academy, and free community membership after publish.

## Scope v1 (parity core)

- Marketing site (ID/EN)
- Template catalog
- 4 service landings
- Order wizard + Xendit
- Customer panel (sites, orders)
- Content: blog, FAQ
- Auth session

## Out of scope v1

- Live multi-tenant site builder editor (use ops provisioning)
- Registrar API (manual/domain stub OK)
- Full academy video hosting
- Dana talangan underwriting

## Success metrics

- Order → paid → site active path works E2E in staging
- Lighthouse marketing ≥ 90 performance/SEO target
- WCAG AA critical flows

## References

- `docs/research/webekspor-analysis.md`
- `DESIGN.md`
- `AGENTS.md`
