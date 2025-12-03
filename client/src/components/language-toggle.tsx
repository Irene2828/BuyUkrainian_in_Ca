import { useI18n, Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ua' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="h-8 px-2 gap-1 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20"
      data-testid="button-language-toggle"
    >
      <span className={`transition-opacity ${language === 'en' ? 'opacity-100 font-bold' : 'opacity-50'}`}>
        EN
      </span>
      <span className="text-gray-300 dark:text-gray-600">/</span>
      <span className={`transition-opacity ${language === 'ua' ? 'opacity-100 font-bold' : 'opacity-50'}`}>
        UA
      </span>
    </Button>
  );
}
