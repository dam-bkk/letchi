import type { LucideIcon } from "lucide-react";
import {
  Users,
  GraduationCap,
  ClipboardList,
  ScanText,
  HardHat,
  LifeBuoy,
  BookOpen,
  Handshake,
  Megaphone,
  ShoppingCart,
  Activity,
  Rocket,
  Globe,
  LayoutTemplate,
  Languages,
  Workflow,
  Receipt,
  Briefcase,
  Trophy,
  CalendarDays,
  Building2,
  KeyRound,
  UserSearch,
  Tag,
  MapPin,
  Heart,
  ChefHat,
  Pill,
  Stethoscope,
} from "lucide-react";

/**
 * Single source of truth for the brand and the product catalog.
 * Components must never hardcode the family name — always read from BRAND.
 */
export const BRAND = {
  /** Family / company name */
  name: "Lakaz",
  /** Country line used in the footer */
  origin: "Mauritius",
} as const;

/** Localized string. Kreol Morisien (`kr`) is stubbed for later. */
export type Localized = {
  en: string;
  fr: string;
  kr?: string;
};

export type ProductStatus = "live" | "soon";

export type Product = {
  id: string;
  /** Product name without the family prefix (rendered as `${BRAND.name} ${name}` where relevant) */
  name: string;
  icon: LucideIcon;
  description: Localized;
  status: ProductStatus;
  /** Absolute URL of the live demo (only when status === "live") */
  demoUrl?: string;
  /** Flagship products get extra visual weight */
  flagship?: boolean;
};

export type ProductCategory = {
  id: string;
  /** Category label without the family prefix, e.g. "People" → "Lakaz People" */
  label: string;
  products: Product[];
};

/** Served at letchi.damien.asia with Books under /books; override via NEXT_PUBLIC_BOOKS_URL */
const BOOKS_DEMO_URL = process.env.NEXT_PUBLIC_BOOKS_URL ?? "/books";

export const CATALOG: ProductCategory[] = [
  {
    id: "people",
    label: "People",
    products: [
      {
        id: "people-manager",
        name: "People Manager",
        icon: Users,
        status: "soon",
        description: {
          en: "HR records, leave and contracts for Mauritian teams, minus the paperwork.",
          fr: "RH, congés et contrats pour les équipes mauriciennes, sans la paperasse.",
        },
      },
      {
        id: "academy",
        name: "Academy",
        icon: GraduationCap,
        status: "soon",
        description: {
          en: "Build training paths and track every certification your staff earns.",
          fr: "Créez des parcours de formation et suivez chaque certification de vos équipes.",
        },
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    products: [
      {
        id: "digital-forms",
        name: "Digital Forms",
        icon: ClipboardList,
        status: "soon",
        description: {
          en: "Turn any paper form into a mobile workflow with approvals built in.",
          fr: "Transformez chaque formulaire papier en flux mobile avec validations intégrées.",
        },
      },
      {
        id: "iq",
        name: "iQ",
        icon: ScanText,
        status: "soon",
        description: {
          en: "Document intelligence that reads invoices, IDs and contracts for you.",
          fr: "L'intelligence documentaire qui lit factures, pièces d'identité et contrats pour vous.",
        },
      },
      {
        id: "fieldwork",
        name: "FieldWork",
        icon: HardHat,
        status: "soon",
        description: {
          en: "Dispatch, track and report field jobs across the island in real time.",
          fr: "Planifiez, suivez et documentez vos interventions terrain en temps réel.",
        },
      },
      {
        id: "itsm",
        name: "ITSM",
        icon: LifeBuoy,
        status: "soon",
        description: {
          en: "A lean service desk: tickets, assets and SLAs without the enterprise price tag.",
          fr: "Un service desk léger : tickets, actifs et SLA sans le prix des géants.",
        },
      },
      {
        id: "library",
        name: "Library",
        icon: BookOpen,
        status: "soon",
        description: {
          en: "One organised, searchable home for every company document and policy.",
          fr: "Un espace unique et consultable pour tous vos documents et procédures.",
        },
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    products: [
      {
        id: "crm",
        name: "CRM",
        icon: Handshake,
        status: "soon",
        description: {
          en: "Pipeline, contacts and follow-ups tuned for how Mauritian SMEs actually sell.",
          fr: "Pipeline, contacts et relances pensés pour la vente à la mauricienne.",
        },
      },
      {
        id: "advertising",
        name: "Advertising",
        icon: Megaphone,
        status: "soon",
        description: {
          en: "Plan campaigns and measure what every rupee of ad spend brings back.",
          fr: "Planifiez vos campagnes et mesurez le retour de chaque roupie investie.",
        },
      },
      {
        id: "commerce",
        name: "Commerce",
        icon: ShoppingCart,
        status: "soon",
        description: {
          en: "Sell online in MUR with local delivery and payment options from day one.",
          fr: "Vendez en ligne en roupies, avec livraison et paiement locaux dès le premier jour.",
        },
      },
    ],
  },
  {
    id: "digital-estate",
    label: "Digital Estate",
    products: [
      {
        id: "monitoring",
        name: "Monitoring",
        icon: Activity,
        status: "soon",
        description: {
          en: "Uptime, SSL and security checks for every site and service you run.",
          fr: "Disponibilité, SSL et sécurité surveillés pour tous vos sites et services.",
        },
      },
      {
        id: "launchpad",
        name: "Launchpad",
        icon: Rocket,
        status: "soon",
        description: {
          en: "Ship landing pages and microsites in hours, not weeks.",
          fr: "Lancez des pages et microsites en quelques heures, pas en semaines.",
        },
      },
      {
        id: "domains",
        name: "Domains",
        icon: Globe,
        status: "soon",
        description: {
          en: "Register, renew and govern your .mu and global domains in one place.",
          fr: "Enregistrez, renouvelez et gérez vos domaines .mu et internationaux au même endroit.",
        },
      },
      {
        id: "websites",
        name: "Websites",
        icon: LayoutTemplate,
        status: "soon",
        description: {
          en: "Fast, managed business websites that stay secure and up to date.",
          fr: "Des sites d'entreprise rapides et gérés, toujours sécurisés et à jour.",
        },
      },
      {
        id: "translation",
        name: "Translation",
        icon: Languages,
        status: "soon",
        description: {
          en: "Publish in English, French and Kreol with translation memory that learns.",
          fr: "Publiez en anglais, français et kreol avec une mémoire de traduction qui apprend.",
        },
      },
      {
        id: "automation",
        name: "Automation",
        icon: Workflow,
        status: "soon",
        description: {
          en: "Connect your tools and let repetitive back-office work run itself.",
          fr: "Connectez vos outils et laissez les tâches répétitives s'exécuter seules.",
        },
      },
    ],
  },
  {
    id: "accounting",
    label: "Accounting",
    products: [
      {
        id: "books",
        name: "Books",
        icon: Receipt,
        status: "live",
        flagship: true,
        demoUrl: BOOKS_DEMO_URL,
        description: {
          en: "Invoicing built for MRA e-invoicing: fiscalise, get your IRN and QR, stay compliant.",
          fr: "Facturation conçue pour l'e-invoicing MRA : fiscalisez, obtenez IRN et QR, restez conforme.",
        },
      },
      {
        id: "sme",
        name: "SME",
        icon: Briefcase,
        status: "soon",
        description: {
          en: "The essentials of running a small Mauritian business, in one simple suite.",
          fr: "L'essentiel de la gestion d'une PME mauricienne, dans une suite simple.",
        },
      },
    ],
  },
  {
    id: "sports-events",
    label: "Sports & Events",
    products: [
      {
        id: "sports",
        name: "Sports",
        icon: Trophy,
        status: "soon",
        description: {
          en: "Clubs, members, fixtures and results managed from a single dashboard.",
          fr: "Clubs, membres, calendriers et résultats gérés depuis un seul tableau de bord.",
        },
      },
      {
        id: "events",
        name: "Events",
        icon: CalendarDays,
        status: "soon",
        description: {
          en: "Ticketing, registration and check-in for events of any size.",
          fr: "Billetterie, inscriptions et accueil pour des événements de toute taille.",
        },
      },
    ],
  },
  {
    id: "property",
    label: "Property",
    products: [
      {
        id: "syndic",
        name: "Syndic",
        icon: Building2,
        status: "live",
        demoUrl: process.env.NEXT_PUBLIC_SYNDIC_URL ?? "/syndic",
        description: {
          en: "Co-ownership made transparent: charges by millièmes, assemblies, works and votes.",
          fr: "La copropriété en toute transparence : charges aux millièmes, assemblées, travaux et votes.",
        },
      },
      {
        id: "lettings",
        name: "Lettings",
        icon: KeyRound,
        status: "soon",
        description: {
          en: "Tenancies, rent collection and maintenance for landlords and agencies.",
          fr: "Baux, loyers et entretien pour propriétaires et agences.",
        },
      },
    ],
  },
  {
    id: "health",
    label: "Health",
    products: [
      {
        id: "pharmacie",
        name: "Pharmacie",
        icon: Pill,
        status: "live",
        demoUrl: process.env.NEXT_PUBLIC_PHARMACIE_URL ?? "/pharmacie",
        description: {
          en: "Pharmacy stock, dispensing and the statutory registers — inspection-ready.",
          fr: "Stock, délivrance et registres réglementaires de la pharmacie — prêts pour l'inspection.",
        },
      },
      {
        id: "klinik",
        name: "Klinik",
        icon: Stethoscope,
        status: "soon",
        description: {
          en: "Appointments, patient records and insurer claims for private clinics.",
          fr: "Rendez-vous, dossiers patients et remboursements assureurs pour cliniques privées.",
        },
      },
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    products: [
      {
        id: "talan",
        name: "Talan",
        icon: UserSearch,
        status: "soon",
        description: {
          en: "Mauritian talent meets Mauritian employers — hiring without the noise.",
          fr: "Les talents mauriciens rencontrent les employeurs mauriciens, sans le bruit.",
        },
      },
      {
        id: "okazion",
        name: "Okazion",
        icon: Tag,
        status: "soon",
        description: {
          en: "Trusted second-hand deals, from smartphones to scooters.",
          fr: "Les bonnes affaires d'occasion en confiance, du smartphone au scooter.",
        },
      },
      {
        id: "voizinaz",
        name: "Voizinaz",
        icon: MapPin,
        status: "soon",
        description: {
          en: "Your neighbourhood online: services, alerts and helping hands nearby.",
          fr: "Votre quartier en ligne : services, alertes et coups de main à proximité.",
        },
      },
    ],
  },
  {
    id: "home",
    label: "Home",
    products: [
      {
        id: "family",
        name: "Family",
        icon: Heart,
        status: "soon",
        description: {
          en: "Shared calendars, lists and budgets that keep the whole family in sync.",
          fr: "Calendriers, listes et budgets partagés pour garder toute la famille synchronisée.",
        },
      },
      {
        id: "recipes",
        name: "Recipes",
        icon: ChefHat,
        status: "soon",
        description: {
          en: "Save, plan and share recipes — from dholl puri to dimanche briani.",
          fr: "Sauvegardez, planifiez et partagez vos recettes, du dholl puri au briani du dimanche.",
        },
      },
    ],
  },
];
