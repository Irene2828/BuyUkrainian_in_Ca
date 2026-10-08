import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { legalContent } from "@/components/legal-modals";

export default function PrivacyPage() {
  const { language } = useI18n();
  const currentLanguage = language === 'fr-CA' ? 'fr' : 'en';
  const data = legalContent.privacy[currentLanguage] || legalContent.privacy.en;

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-24 font-sans">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/">
          <a className="text-[#0057B7] hover:underline mb-8 inline-block font-medium">
            {language === 'fr-CA' ? "← Retour à l'accueil" : "← Back to Home"}
          </a>
        </Link>
        
        <div className="bg-white p-8 md:p-12 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {data.title}
          </h1>
          {data.lastUpdated && (
            <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-8">
              {data.lastUpdated}
            </p>
          )}

          {data.body}
        </div>
      </div>
    </div>
  );
}
