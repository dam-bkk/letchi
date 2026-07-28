// Single source of brand truth — never hardcode names in components.
export const BRAND = {
  family: "Lakaz",
  product: "Lakaz Books",
  tagline: "Invoicing & accounting, made for Mauritius",
  demoNotice: "Demo environment — MRA fiscalisation is simulated",
  hubUrl: process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3400",
} as const;
