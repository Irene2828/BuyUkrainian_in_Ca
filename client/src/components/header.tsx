import { Link, useLocation } from "wouter";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/lib/i18n";

export function Header() {
  const [, navigate] = useLocation();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="relative w-4 h-4 rounded-full bg-blue-accent flex items-center justify-center overflow-hidden">
            <div className="absolute bottom-0 w-full h-1/2 bg-yellow-accent"></div>
          </div>
          <span className="font-semibold text-lg tracking-tight">BlueYellow.ca</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/about" className="text-sm font-medium hover:text-blue-accent transition-colors">{t("header.about")}</Link>
          <a href="/#how-it-works" className="text-sm font-medium hover:text-blue-accent transition-colors">{t("header.howItWorks")}</a>
          <a href="/#faq" className="text-sm font-medium hover:text-blue-accent transition-colors">{t("header.faq")}</a>
        </nav>

        {/* CTA / Mobile Menu */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <div className="hidden md:block">
            <Button 
              className="rounded-full px-6 h-10 bg-yellow-accent text-black hover:bg-yellow-400 border-none font-medium"
              onClick={() => navigate("/map?add=true")}
              data-testid="button-add-product-header"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("header.addProduct")}
            </Button>
          </div>
          <div className="hidden md:block">
            <Button 
              variant="outline" 
              className="rounded-full px-6 h-10 border-border"
              onClick={() => navigate("/map")}
              data-testid="button-explore-map-header"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {t("header.exploreMap")}
            </Button>
          </div>
          
          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-3">
             <Link href="/about" className="text-xs font-medium text-foreground/80">{t("header.about.short")}</Link>
             <a href="/#faq" className="text-xs font-medium text-foreground/80">{t("header.faq")}</a>
             <Button 
               variant="ghost"
               className="text-xs font-bold text-blue-accent p-0 h-auto"
               onClick={() => navigate("/map?add=true")}
               data-testid="button-add-product-mobile"
             >
               {t("header.addProductShort")}
             </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
