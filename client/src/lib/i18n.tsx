import i18n, { type TFunction } from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { type ReactNode, useEffect } from "react";
import en from "../locales/en";
import uk from "../locales/uk";
import frCA from "../locales/frCA";

export type Language = "en" | "uk" | "fr-CA";
type LanguageInput = Language | "ua" | "fr";

export const LANGUAGE_STORAGE_KEY = "language";
export const PUBLIC_LANGUAGES: Language[] = ["en", "uk"];
export const INTERNAL_LANGUAGES: Language[] = ["en", "uk", "fr-CA"];

const resources = {
  en: { translation: en },
  uk: { translation: uk },
  "fr-CA": { translation: frCA },
} as const;

const PROVINCE_KEY_MAP: Record<string, keyof typeof en.common.geography.provinces> = {
  Alberta: "alberta",
  "British Columbia": "britishColumbia",
  Manitoba: "manitoba",
  "New Brunswick": "newBrunswick",
  "Newfoundland and Labrador": "newfoundlandAndLabrador",
  "Nova Scotia": "novaScotia",
  Ontario: "ontario",
  "Prince Edward Island": "princeEdwardIsland",
  Quebec: "quebec",
  Saskatchewan: "saskatchewan",
  "Northwest Territories": "northwestTerritories",
  Nunavut: "nunavut",
  Yukon: "yukon",
};

const normalizeLanguage = (value: string | null | undefined): Language => {
  const normalized = (value ?? "").trim().toLowerCase();

  if (normalized === "ua" || normalized === "uk" || normalized.startsWith("uk-")) {
    return "uk";
  }

  if (normalized === "fr" || normalized === "fr-ca" || normalized.startsWith("fr-")) {
    return "fr-CA";
  }

  return "en";
};

const detectInitialLanguage = (): Language => {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored) {
    const canonical = normalizeLanguage(stored);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, canonical);
    return canonical;
  }

  const browserLanguage = normalizeLanguage(window.navigator.language);
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, browserLanguage);
  return browserLanguage;
};

const collectLeafPaths = (value: unknown, prefix = ""): string[] => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    collectLeafPaths(nested, prefix ? `${prefix}.${key}` : key),
  );
};

const assertLocaleCoverage = (
  canonical: Record<string, unknown>,
  localeEntries: Record<string, Record<string, unknown>>,
) => {
  const canonicalPaths = new Set(collectLeafPaths(canonical));

  Object.entries(localeEntries).forEach(([locale, localeObject]) => {
    const localePaths = new Set(collectLeafPaths(localeObject));
    const missingPaths = Array.from(canonicalPaths).filter((path) => !localePaths.has(path));

    if (missingPaths.length > 0) {
      throw new Error(
        `Missing translation keys in ${locale}: ${missingPaths.slice(0, 12).join(", ")}${missingPaths.length > 12 ? "..." : ""}`,
      );
    }
  });
};

assertLocaleCoverage(en as Record<string, unknown>, {
  uk: uk as Record<string, unknown>,
  "fr-CA": frCA as Record<string, unknown>,
});

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: "en",
  supportedLngs: INTERNAL_LANGUAGES,
  interpolation: {
    escapeValue: false,
  },
});

const syncDomLanguage = (language: Language) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
};

syncDomLanguage(normalizeLanguage(i18n.resolvedLanguage ?? i18n.language));

export default i18n;

export const getTranslatedProvinceName = (province: string, t: TFunction) => {
  const key = PROVINCE_KEY_MAP[province];
  return key ? t(`common.geography.provinces.${key}`) : province;
};

export const getCategoryLabel = (category: string, t: TFunction) => {
  const validCategory = category as keyof typeof en.common.categories;
  return t(`common.categories.${validCategory}`);
};

export function useI18n() {
  const { t, i18n: instance } = useTranslation();
  const language = normalizeLanguage(instance.resolvedLanguage ?? instance.language);

  const setLanguage = (nextLanguage: LanguageInput) => {
    const canonicalLanguage = normalizeLanguage(nextLanguage);
    void instance.changeLanguage(canonicalLanguage);
    syncDomLanguage(canonicalLanguage);
  };

  return { t, language, setLanguage };
}

type LocalizedDocumentOptions = {
  titleKey: string;
  descriptionKey?: string;
};

const setMetaContent = (selector: string, content: string) => {
  if (typeof document === "undefined") {
    return;
  }

  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) {
    element.setAttribute("content", content);
    return;
  }

  const meta = document.createElement("meta");

  if (selector.includes("property=")) {
    const property = selector.match(/property="([^"]+)"/)?.[1];
    if (property) {
      meta.setAttribute("property", property);
    }
  } else if (selector.includes("name=")) {
    const name = selector.match(/name="([^"]+)"/)?.[1];
    if (name) {
      meta.setAttribute("name", name);
    }
  }

  meta.setAttribute("content", content);
  document.head.appendChild(meta);
};

export function useLocalizedDocument({ titleKey, descriptionKey }: LocalizedDocumentOptions) {
  const { t, language } = useI18n();

  useEffect(() => {
    const title = t(titleKey);
    if (title && title !== titleKey) {
      document.title = title;
    }

    if (descriptionKey) {
      const description = t(descriptionKey);
      if (description && description !== descriptionKey) {
        setMetaContent('meta[name="description"]', description);
        setMetaContent('meta[property="og:description"]', description);
        setMetaContent('meta[name="twitter:description"]', description);
      }
    }

    if (title && title !== titleKey) {
      setMetaContent('meta[property="og:title"]', title);
      setMetaContent('meta[name="twitter:title"]', title);
    }

    syncDomLanguage(language);
  }, [descriptionKey, language, t, titleKey]);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { i18n: instance } = useTranslation();
  const language = normalizeLanguage(instance.resolvedLanguage ?? instance.language);

  useEffect(() => {
    if (instance.resolvedLanguage !== language) {
      void instance.changeLanguage(language);
    }

    syncDomLanguage(language);
  }, [instance, language]);

  return (
    <div key={language} className="animate-in fade-in duration-300">
      {children}
    </div>
  );
}

export function generateLocalizedShareTexts(
  store: { name: string; products: string[]; address: string; description: string; category: string },
  language: Language,
) {
  const fixedT = i18n.getFixedT(language);
  const products = store.products.slice(0, 3).join(", ");
  const emoji = store.category === "food" ? "🍞" : store.category === "retail" ? "🛍️" : "🇺🇦";
  const shortAddress = store.address.split(",")[0];

  return {
    twitter: fixedT("share.store.twitter", { emoji, name: store.name, products }),
    facebook: fixedT("share.store.facebook", {
      name: store.name,
      products,
      address: store.address,
      description: store.description,
    }),
    instagram: fixedT("share.store.instagram", {
      name: store.name,
      products,
      description: store.description,
      shortAddress,
    }),
  };
}
