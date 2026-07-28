# Letchi — SaaS family for Mauritius

Workspace: `/Users/damien/projects/mu-suite` (folder name is neutral; brand = **Letchi**).
Partner: Ked (Mauritius). Goal: family of independent SaaS products on a shared platform,
demoed from the OCI VM, aimed at the Mauritian market (then Réunion / Madagascar / Seychelles).

## Strategy (from SaaS-Opportunities-Mauritius market map, July 2026)
- Build the **horizontal layer** once: SSO, multi-tenancy, audit trail, document extraction,
  FR/EN/Kreol language layer. Ship verticals on top.
- Tier 1 = MRA e-invoicing (mandated, penalised, phased) and AML/KYC/UBO.
- Do NOT build: payroll, generic CRM, generic accounting *for its own sake* —
  Letchi Books exists as the **carrier for e-invoicing compliance**, not to fight Sage/QuickBooks.
- Trilingual reality: EN (law/gov), FR (business), Kreol Morisien (speech). UI ships EN+FR,
  Kreol as progressive differentiator.

## Products in this workspace
| App | Folder | Port (dev) | What it is |
|---|---|---|---|
| Letchi Hub | `hub/` | 3400 | Master site: product family grid, brand home, links to demos |
| Letchi Books | `nexbooks/` | 3401 | Invoicing-first accounting + **MRA e-invoicing demo** (flagship) |

Verticals queued next (decision 2026-07-28): MySyndic (co-ownership), School management.

## Architecture rules
- **Shared platform, per-app DBs.** Each SaaS = its own Next.js app + own SQLite (demo) /
  Postgres (prod path) on a subdomain. No cross-app DB access.
- Auth: demo phase = per-app one-click demo login (seeded users). Prod path = central SSO
  (qnet-auth pattern).
- **Every mutation writes an audit-log row** (infra standard). Status page + offsite JSON
  backup (R2) before anything is called production.
- Brand is configurable: one `lib/brand.ts` per app exporting names — never hardcode
  "Letchi" in components.
- Money: MUR, integer cents. VAT: Mauritius standard 15%.
- Deploy: build → GitHub → OCI VM pull → docker compose (TAQ/campaigns pattern).
  NO rsync/scp/docker-cp of code.

## Stack (locked)
Next.js 16 · Tailwind 4 · Prisma 7 + `@prisma/adapter-better-sqlite3` (schema kept
Postgres-portable) · lucide-react · next-intl NOT used (lightweight in-house dictionary
EN/FR to stay dependency-thin).

### Known gotchas (from SaaS Flow, May 2026 — re-verify on current versions)
- Prisma 7: no `url` in schema datasource → `prisma.config.ts`; generator `prisma-client`
  output `lib/generated/prisma/`.
- Next 16: `proxy.ts` (fn `proxy`) replaces `middleware.ts`; shadcn is base-ui (no
  `asChild`); `Select.onValueChange` gives `string | null`; set `turbopack.root` if a parent
  lockfile exists.

## Design system — "Letchi"
Reference: **TrackSpend layout language** (user decision 2026-07-28) — white/off-white top
nav with labeled icon tabs, KPI strip card under the page title, dense clean data tables
with subtle tinted grouping columns, card-based pages, light/dark toggle, avatar chip.
Palette modernised to **blue primary** + letchi-red brand accent + subtle Mauritian
four-stripe motif (red/blue/yellow/green) as a thin decorative stripe. Lucide icons only —
no emojis as UI elements. AVIF for raster. Light + dark from day one.

### Tokens (WCAG-validated 2026-07-28, blue variant)
| Token | Light | Dark | Grade |
|---|---|---|---|
| `--bg` | `#F8F9FB` | `#0B1220` | |
| `--card` | `#FFFFFF` | `#111A2E` | |
| `--text` | `#0E1626` | `#E8EDF7` | AAA |
| `--muted` | `#55627A` | `#93A3C0` | AA / AAA |
| `--primary` | `#2050E0` (white text, AA) | `#8AA8FF` (**dark** text `#0B1220`, AAA) | |
| `--primary-hover` | `#1A41B8` (white text) | — | AAA |
| `--accent` (letchi red) | text `#C03A26` on bg (AA); chip `#FFE1DB` w/ `#8A2314` (AAA) | `#FF8A70` on dark | |
| `--success` | `#157F3D` white text | lighten for dark | AA |
| Flag stripe | `#EA2839 #1A206D #FFD500 #00A551` | decorative only | |

Type: system-ui stack for now; brand font decision deferred to hub design pass.
Titles use one clamp-based scale shared across sections (no ad-hoc sizes).

## Mauritius facts baked into Books
- VAT 15%; invoice, credit note, debit note all fiscalisable documents.
- MRA EBS: real-time JSON → Invoice Fiscalisation Platform → returns IRN + QR **before**
  invoice goes to customer. 5-year retention. Fines MUR 5k–10k/month → 200k max.
- Phases: 1 (>100M, live 2024) · 2 (>80M) · 3 (50–80M) · 4 (rest). Target buyers = Phase 3/4.
- Demo ships an **IFP simulator** (in-app mock of the MRA endpoint); real API + developer
  account requires Ked's locally-registered BRN company — pending.
