// Single source of brand truth — never hardcode names in components.
export const BRAND = {
  family: "Letchi",
  product: "Letchi Syndic",
  tagline: "Co-ownership management, made for Mauritius",
  demoNotice: "Demo environment — seeded data, resets on redeploy",
  hubUrl: process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3400",
} as const;
