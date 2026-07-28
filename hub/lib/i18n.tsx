"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Localized } from "./brand";

/** Kreol Morisien ("kr") is reserved in the Localized type for later. */
export type Lang = "en" | "fr";

const STORAGE_KEY = "letchi.lang";

const DICT = {
  "nav.products": { en: "Products", fr: "Produits" },
  "nav.vision": { en: "Vision", fr: "Vision" },
  "nav.contact": { en: "Contact", fr: "Contact" },
  "nav.theme": { en: "Toggle theme", fr: "Changer de thème" },
  "nav.language": { en: "Language", fr: "Langue" },

  "hero.title": {
    en: "One platform. Every Mauritian business.",
    fr: "Une plateforme. Toutes les entreprises mauriciennes.",
  },
  "hero.subtitle": {
    en: "A family of simple, connected SaaS products built in Mauritius — from MRA-compliant invoicing to HR, property and everyday life.",
    fr: "Une famille de produits SaaS simples et connectés, conçus à Maurice — de la facturation conforme MRA aux RH, à l'immobilier et au quotidien.",
  },
  "hero.ctaProducts": { en: "Explore the products", fr: "Découvrir les produits" },
  "hero.ctaDemo": { en: "Try the Books demo", fr: "Essayer la démo Books" },

  "flagship.kicker": { en: "The flagship", fr: "Le produit phare" },
  "flagship.title": { en: "MRA e-invoicing, handled.", fr: "L'e-invoicing MRA, maîtrisé." },
  "flagship.body": {
    en: "Letchi Books turns every invoice into a fiscalised document: prescribed JSON to the MRA, IRN and QR code back in real time, a tamper-proof hash chain and five-year retention. Accounting that keeps you compliant by default.",
    fr: "Letchi Books fait de chaque facture un document fiscalisé : JSON prescrit vers la MRA, IRN et QR code en temps réel, chaîne de hachage inviolable et conservation cinq ans. Une comptabilité conforme par défaut.",
  },

  "products.title": { en: "The product family", fr: "La famille de produits" },
  "products.subtitle": {
    en: "Independent products, one shared platform: one login, one language layer, one audit trail.",
    fr: "Des produits indépendants, une plateforme commune : un seul compte, une seule couche de langue, un seul journal d'audit.",
  },

  "badge.live": { en: "Live demo", fr: "Démo en ligne" },
  "badge.soon": { en: "Coming soon", fr: "Bientôt" },
  "badge.flagship": { en: "Flagship", fr: "Produit phare" },

  "why.title": { en: "Why Mauritius, why now", fr: "Pourquoi Maurice, pourquoi maintenant" },
  "why.subtitle": {
    en: "Three forces are reshaping how the island's businesses work.",
    fr: "Trois forces transforment la façon de travailler des entreprises de l'île.",
  },
  "why.mra.title": { en: "MRA e-invoicing is mandatory", fr: "L'e-invoicing MRA devient obligatoire" },
  "why.mra.body": {
    en: "Real-time fiscalisation is rolling out phase by phase, with fines for late adopters. Every invoice will need an IRN and QR before it reaches the customer — most SMEs are not ready.",
    fr: "La fiscalisation en temps réel se déploie phase par phase, avec des amendes à la clé. Chaque facture devra obtenir un IRN et un QR avant d'atteindre le client — la plupart des PME ne sont pas prêtes.",
  },
  "why.lang.title": { en: "Three languages, one country", fr: "Trois langues, un seul pays" },
  "why.lang.body": {
    en: "Law speaks English, business speaks French, everyday life speaks Kreol Morisien. Software here must be genuinely trilingual — not translated as an afterthought.",
    fr: "La loi parle anglais, les affaires parlent français, le quotidien parle kreol morisien. Le logiciel doit être réellement trilingue — pas traduit après coup.",
  },
  "why.sme.title": { en: "The SME digitalisation gap", fr: "Le retard numérique des PME" },
  "why.sme.body": {
    en: "Thousands of Mauritian SMEs still run on paper, spreadsheets and WhatsApp. Affordable, local-first tools can leapfrog them straight to modern operations.",
    fr: "Des milliers de PME mauriciennes fonctionnent encore au papier, aux tableurs et à WhatsApp. Des outils abordables et pensés localement peuvent les faire passer directement à l'ère moderne.",
  },

  "footer.made": { en: "Made in Mauritius", fr: "Conçu à Maurice" },
  "footer.contact": { en: "Get in touch", fr: "Contactez-nous" },
  "footer.rights": {
    en: "All products are independent apps on one shared platform.",
    fr: "Tous les produits sont des applications indépendantes sur une plateforme commune.",
  },
} satisfies Record<string, Localized>;

export type DictKey = keyof typeof DICT;

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a dictionary key */
  t: (key: DictKey) => string;
  /** Resolve an inline Localized object (e.g. product descriptions) */
  l: (value: Localized) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "fr") setLangState(stored);
    } catch {
      /* storage unavailable — keep default */
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next;
  }, []);

  const t = useCallback((key: DictKey) => DICT[key][lang], [lang]);
  const l = useCallback((value: Localized) => value[lang], [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, l }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
