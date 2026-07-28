// Single source of brand truth — never hardcode names in components.
export const BRAND = {
  family: "Lakaz",
  product: "Lakaz Pharmacie",
  tagline: "Pharmacy management, made for Mauritius",
  demoNotice: "Demo environment — Farmasi Sourire is a fictional pharmacy",
  hubUrl: process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3400",
} as const;
