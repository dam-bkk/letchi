# Letchi — Mauritius SaaS strategy & proposals
Compiled 2026-07-28 from the market-map PDF + 5 deep research passes (MRA spec, legal/ops,
competitors, healthcare, delivery/groceries). Every claim below is sourced in the research
briefs; items marked ⚠ are unverified with authorities.

## 1. The headline facts
- **E-invoicing wave is NOW**: MRA threshold drops to **turnover > Rs 40M on 1 Sep 2026**
  (already at 80M since 30 Jun 2026). Budget 2026-27 escalates penalties to **Rs 5,000/day
  (cap Rs 1M)** and up to **Rs 500k + 2 years' imprisonment** (⚠ pending Finance Act).
- **98 EBS solution providers** are registered with the MRA (15 Jul 2026 list) — but they
  are ERP resellers (Sage/Odoo/SAP channel) and thin invoicing utilities. **No local
  Xero-class cloud accounting SaaS exists.** That's exactly the Letchi Books slot.
- Provider registration = self-certification on the MRA sandbox ("test drive"), per
  brand+model, needs a **local BRN company** (all 98 have one). No fees mentioned anywhere ⚠.
- **Hosting on OCI abroad is lawful** (DPA 2017 s.36; no data-residency mandate). Must
  register as controller with the Data Protection Office (Rs 1,000–2,500, 3-year cert)
  and declare transfer destinations. FSC/BOM-regulated *clients* bring extra contract
  duties (cloud-location notice, audit rights) — not blockers.
- **Payments**: Stripe unavailable in Mauritius. Local MUR recurring billing → **MIPS**
  (Rs 550–1,650/mo + fees) or Peach Payments (cards + MCB Juice + MauCAS QR). Export
  revenue → Paddle (merchant of record). Pricing benchmark: Payroll Mauritius sells at
  Rs 350–6,750/mo — that's the local SaaS price ceiling zone.
- **SME grants (TINS)**: 80% funded, caps Rs 50k–250k, BUT ≥51% Mauritian shareholding
  required (Ked ✓) and a service provider is capped at **5 funded projects cumulatively** —
  a demo-closer, not a business model.
- **Company setup**: CBRIS incorporation ≤3 days, <Rs 5,000, needs one Mauritius-resident
  director (Ked ✓). BRN comes automatically → unlocks MRA developer account.

## 2. Naming — "Letchi" verdict: USABLE (medium risk)
- No exact-spelling "Letchi" software company exists anywhere. Creole spelling is
  distinctive; Mauritius itself is clean (the fruit is generic).
- Phonetic neighbours exist and coexist heavily (Litchi drone app, Lychee retail CRM,
  Lychee photo tool…) — fruit words are weak marks, coexistence is the norm. Sharpest
  collision: lychee.is (retail CRM) vs a future "Letchi CRM".
- **Mitigations**: always two-word lockups ("Letchi Books"); register **letchi.mu, letchi.io,
  getletchi.com now** (all appear available; letchi.com is registered-but-dead, possibly
  acquirable); file MU trademark class 42; don't lead with a bare-name CRM flagship.
- Backups if ever needed: **Kapav** (low risk), **Koste**, **Lakour**.

## 3. What exists today (built 2026-07-28)
- **Letchi Hub** (`hub/`, port 3400): master site, 9 categories / 24 products, EN/FR,
  light/dark, WCAG-validated blue palette, TrackSpend-inspired layout, Books "Live demo".
- **Letchi Books** (`nexbooks/`, port 3401, served at `/books`): invoicing-first accounting —
  customers, products, MUR/VAT 15%, credit/debit notes, payments (incl. MCB Juice/my.t),
  dashboard (outstanding/overdue/VAT autopilot/aging), **MRA e-invoicing demo** aligned to
  the real published spec (prescribed JSON fields, IFP simulator returning IRN + QR,
  tamper-proof hash chain, offline-retention story), **Compliance Cockpit** (rollout
  timeline, penalty calculator, fiscalised ledger + chain-integrity check), WhatsApp
  payment reminders in EN/FR/Kreol, full audit trail.
- Next killer feature (needs AI key decision): **document inbox — photo/PDF of any supplier
  invoice → extracted, validated, MRA-ready JSON**. This is the defensible product per the
  market map (Phase 3/4 buyers have filing cabinets, not ERPs).

## 4. Proposed NEW SaaS for Mauritius (beyond Ked's map), ranked
Each rides the same platform layer (SSO, audit, doc-extraction, FR/EN/Kreol).

### Tier A — compliance-forced or empty-with-buyer
1. **Letchi Pharmacie** — pharmacy management. *Strongest empty gap found.* No local vendor,
   no French LGO presence, no e-prescription mandate yet. Killer: statutory compliance
   out-of-the-box — digital Prescription Book (2-yr retention), Dangerous Drugs register
   with inspection-ready exports, batch/expiry, POS/stock. ⚠ Verify with Pharmacy Council
   that a digital register satisfies inspectors.
2. **Letchi KYC** — AML/KYC/UBO evidence packs for management companies (market map's #2:
   highest contract values, 2027 ESAAMLG evaluation, 20% UBO threshold quirk). Long sales
   cycle — start with one design-partner management company.
3. **Letchi Syndic (MySyndic)** — co-ownership management. Gap confirmed empty: incumbents
   are service firms importing French Vilogi. Mauritius-law-native (Code Civil syndic
   regime, RES/PDS), MUR charge apportionment, AGM minutes, photo defect logging.
4. **Letchi Livrezon** — merchant delivery management ("gestion des livraisons"). Confirmed
   empty: restaurants/shops dispatch via WhatsApp+paper; only consumer marketplaces
   (HungryDodo, OrderManzer, Bongéni) or USD imports exist. Order intake → dispatch →
   driver app → live tracking link → digital POD → COD reconciliation, FR/EN, Rs-priced.
   Compliance hook: every delivery sale emits a fiscalised (MRA) invoice — no import does that.
   Groceries enablement for independents (superettes/butchers — the non-Winners tail) is a
   vertical of this, not a standalone bet.

### Tier B — strong, needs partner or timing
5. **Letchi Klinik** — small-clinic EMR + booking, timed to the Digital Health Law / DHAB
   interoperability wave (drafting through 2026 — both the risk and the moat). Includes the
   RDV/Doctolib angle: independent specialists + dental as a module (dental standalone =
   too small). Differentiator: **provider-side insurance-claims rail** — generate
   Swan/MUA/Medscheme/NIC claim bundles; one Medscheme partnership (~75k lives, TPA for
   several insurers) covers many payers. Nobody owns this rail.
6. **Letchi Lekol** — school management for local private/tuition segment (French lycées are
   locked by Pronote, internationals by iSAMS; KIDStory is the only small local player).
   Exports cleanly to Réunion/Madagascar. Parent portal FR/EN/Kreol.
7. **Letchi Gouvernman** — gov-grade admin (Damien's ask): citizen-services desk with
   **Kreol-first** correspondence/chat (the language layer the market map calls the moat),
   permits/licence workflow, registry digitisation on the doc-extraction layer.
   Route in via tenders/GovCloud; expect local-hosting requirements ⚠ — sell as
   deployable-on-premise. Realistic wedge: municipalities/parastatals, not ministries.
8. **Letchi Gîte** — guesthouse/villa PMS for small operators. International tools
   (eZee, Little Hotelier) serve them but **none is MRA-fiscalised** — compliance wedge +
   multilingual guest comms. Low ARPU: only viable as an app on the shared layer.

### Avoid (occupied/structural)
- Payroll (EasyPay biometrics moat, Sicorax 1,200 clients, Payroll Mauritius cheap cloud) —
  integrate, don't fight. Same for generic CRM, generic classifieds (lexpress + Facebook),
  consumer food delivery marketplace, vehicle GPS tracking (5+ local firms in a price war).

## 5. Sequencing recommendation
1. **Now–Sep**: polish Books demo + document-inbox AI feature; Ked incorporates the company
   (BRN) → MRA developer portal signup → sandbox → test drive. Design partners: 3 firms in
   the 40–80M band (deadline pressure = 1 Sep).
2. **Q4 2026**: MIPS billing + DPO registration + letchi.mu/.io + trademark. First paying
   Books customers; start Syndic or Pharmacie as second vertical (pick by first design
   partner found — distribution beats product here).
3. **2027**: KYC vertical ahead of the ESAAMLG evaluation; license the extraction layer to
   ERP resellers (turns the 98-provider list from competitors into channel).

## 6. Damien's existing assets → Letchi map
| Letchi product | Existing asset to port |
|---|---|
| Books | built today (new) |
| ITSM | Freshservice-replacement concept (with Ked) |
| Digital Forms / iQ | TAQ (assessments, CF pattern) |
| Monitoring / Domains / Websites | WEB360 + Qlever |
| Translation | PolyQi engine + TM know-how (FR/EN/Kreol later) |
| Launchpad (analytics) | Lisa Analytics |
| Advertising | Campaigns Tracker |
| Sports | CourtBase / SenTrack / Songa |
| Academy | Nuance patterns |
| Lettings | ThaiHouz / BangkokProp collector |
| CRM | SenTrack CRM core |
