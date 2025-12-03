import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t, language } = useI18n();
  
  return (
    <footer className="bg-[#F8F8F8] pt-16 pb-8 border-t border-border/40">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">{language === 'ua' ? 'Про BlueYellow.ca' : 'About BlueYellow.ca'}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">{language === 'ua' ? 'Швидкі посилання' : 'Quick Links'}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/map" className="hover:text-blue-accent transition-colors">{t("footer.map")}</Link></li>
              <li><Link href="/map" className="hover:text-blue-accent transition-colors">{t("footer.addLocation")}</Link></li>
              <li><a href="#how-it-works" className="hover:text-blue-accent transition-colors">{t("footer.howItWorks")}</a></li>
              <li><Link href="/about" className="hover:text-blue-accent transition-colors">{t("footer.about")}</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">{language === 'ua' ? 'Підтримка' : 'Support'}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#faq" className="hover:text-blue-accent transition-colors">{t("footer.faq")}</a></li>
              <li><a href="mailto:hello@blueyellow.ca" className="hover:text-blue-accent transition-colors">{language === 'ua' ? 'Зв\'язатися' : 'Contact Us'}</a></li>
              <li><a href="#" className="hover:text-blue-accent transition-colors">{t("footer.privacy")}</a></li>
              <li><a href="#" className="hover:text-blue-accent transition-colors">{t("footer.terms")}</a></li>
            </ul>
          </div>

          {/* Column 4 - Admin */}
          <div className="space-y-4">
            <h4 className="font-semibold text-base">{language === 'ua' ? 'Адмін' : 'Admin'}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/admin/login" className="hover:text-blue-accent transition-colors font-medium">
                  {language === 'ua' ? 'Панель керування' : 'Dashboard'}
                </Link>
              </li>
              <li><span className="text-xs text-gray-400">{language === 'ua' ? 'Тільки для модераторів' : 'For moderators only'}</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© 2025 BlueYellow.ca</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{language === 'ua' ? 'Зроблено з' : 'Made with'}</span>
            <span className="text-yellow-accent">♥</span>
            <span>{language === 'ua' ? 'для української спільноти в Канаді' : 'for the Ukrainian community in Canada'}</span>
          </div>
          <a href="mailto:hello@blueyellow.ca" className="hover:text-blue-accent transition-colors">hello@blueyellow.ca</a>
        </div>
      </div>
    </footer>
  );
}
