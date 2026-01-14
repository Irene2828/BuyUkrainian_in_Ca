import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ReactNode, useEffect } from 'react';
import en from '../locales/en.json';
import uk from '../locales/uk.json';

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      uk: { translation: uk } // 'uk' is the standard code for Ukrainian
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language', // keep using 'language' key if possible, or migrate
    }
  });

export default i18n;

export type Language = 'en' | 'ua';

// Legacy compatibility hook
export function useI18n() {
  const { t, i18n } = useTranslation();

  const setLanguage = (lang: Language) => {
    // Map 'ua' (custom) to 'uk' (standard)
    const code = lang === 'ua' ? 'uk' : 'en';
    i18n.changeLanguage(code);
    document.documentElement.lang = code;
  };

  // Map 'uk' back to 'ua' for consumers expecting 'ua'
  const language: Language = (i18n.language === 'uk' || i18n.language === 'ua') ? 'ua' : 'en';

  return { t, language, setLanguage };
}

// Simplified Provider (mostly for backward compatibility if it was wrapping things)
// i18next is effectively global, but we can ensure language attribute is set here too
export function I18nProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div key={i18n.language} className="animate-in fade-in duration-300">
      {children}
    </div>
  );
}

export function generateLocalizedShareTexts(store: { name: string; products: string[]; address: string; description: string; category: string }, language: Language) {
  const products = store.products.slice(0, 3).join(', ');
  const emoji = store.category === 'food' ? '🍞' : store.category === 'retail' ? '🛍️' : '🇺🇦';
  const shortAddress = store.address.split(',')[0];

  if (language === 'ua') {
    return {
      twitter: `${emoji} Щойно відкрив(ла) ${store.name} — вони продають автентичні українські товари: ${products}! Підтримуйте український бізнес в Канаді 🇺🇦💙💛 #MadeInUkraine #BuyUkrainian #SupportUkraine`,
      facebook: `Знайшов(ла) чудовий український магазин ${store.name}! 🇺🇦\n\nВони продають: ${products}\n📍 ${store.address}\n\n${store.description}\n\nПідтримуйте український бізнес в Канаді! Більше на BuyUkrainian.ca 💙💛`,
      instagram: `🇺🇦 ВІДКРИЙТЕ УКРАЇНСЬКІ ТОВАРИ 🇺🇦\n\n📍 ${store.name}\n\n${store.description}\n\n✨ Товари: ${products}\n📍 Локація: ${shortAddress}\n\n#MadeInUkraine #UkrainianProducts #SupportUkraine #BuyUkrainian #УкраїнськийБізнес #ShopLocal #УкраїнськаЇжа #CanadaUkraine #УкраїнськаСпільнота #СлаваУкраїні 💙💛`,
    };
  }

  return {
    twitter: `${emoji} Just discovered ${store.name} - they sell authentic Ukrainian products like ${products}! Support local Ukrainian businesses in Canada 🇺🇦💙💛 #MadeInUkraine #BuyUkrainian #SupportUkraine`,
    facebook: `I found this amazing Ukrainian store called ${store.name}! 🇺🇦\n\nThey sell: ${products}\n📍 ${store.address}\n\n${store.description}\n\nSupport Ukrainian businesses in Canada! Find more at BuyUkrainian.ca 💙💛`,
    instagram: `🇺🇦 DISCOVER UKRAINIAN PRODUCTS 🇺🇦\n\n📍 ${store.name}\n\n{description}\n\n✨ Products: ${products}\n📍 Location: ${shortAddress}\n\n#MadeInUkraine #UkrainianProducts #SupportUkraine #BuyUkrainian #UkrainianBusiness #ShopLocal #UkrainianFood #CanadaUkraine #UkrainianCommunity #SlavaUkraini 💙💛`,
  };
}
