import { Link, useLocation } from "wouter";
import { Search, Menu, X, ArrowRight, Plus, HelpCircle, MapPin, ArrowLeft, Map, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

import { useFlagsABTest } from "@/hooks/use-ab-test";
import { LanguageSwitcher } from "@/components/language-switcher";
import { HEADER_NAV_LINK_ACTIVE_CLASSNAME, HEADER_NAV_LINK_CLASSNAME } from "@/components/nav-link-styles";

import newLogo from "@/assets/newlogo.png";
import logoJuly29 from "@/assets/logo-july29.png";
import flagsLogo from "@/assets/logoo.png";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useI18n();

  const getIsVersionB = () => {
    if (typeof window === "undefined") return true;
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get("hero") || params.get("variant") || params.get("ab") || "").toLowerCase();
    if (raw === "a" || raw === "variant-a" || raw === "version-a") return false;
    return true;
  };

  const [isVersionB, setIsVersionB] = useState<boolean>(() => getIsVersionB());

  useEffect(() => {
    const syncVersion = () => setIsVersionB(getIsVersionB());
    syncVersion();
    window.addEventListener("popstate", syncVersion);
    return () => window.removeEventListener("popstate", syncVersion);
  }, [location]);

  const [, setVariant] = useState<'A' | 'B'>((window as any).__VARIANT__ || 'A');

  // Track scroll position for Glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleKey = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
            e.preventDefault();
            const next = (window as any).__VARIANT__ === 'A' ? 'B' : 'A';
            (window as any).__VARIANT__ = next;
            setVariant(next);
        }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500 ease-in-out font-sans backdrop-blur-xl",
        isScrolled
          ? "bg-white/80 border-b border-slate-200/40"
          : "bg-white/90 border-b border-slate-200/70"
      )}
    >
      <div className="w-full h-[73px] relative z-10 px-5 md:px-8 lg:px-10">
        <div className="flex h-full items-center justify-between">

        {/* Left: Logo & Branding */}
        <div className="flex-1 flex items-center justify-start gap-1.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="no-invert-hover md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-600"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 fill-none stroke-current" strokeWidth={2} /> : <Menu className="w-6 h-6 fill-none stroke-current" strokeWidth={2} />}
          </button>

          <Link href="/" className="flex items-center group mr-2">
            <img 
              src={flagsLogo} 
              alt="BuyUkrainian.ca" 
              className="h-[63.8px] min-[1024px]:h-[70.7px] min-[1670px]:h-[75.6px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
            />
          </Link>

          {/* Vertical Divider */}
          <div className="hidden md:block w-[1.5px] h-[22px] bg-slate-300 origin-center mx-1" />

          {/* Caption Next to Logo */}
          <div className="hidden md:flex flex-col text-[12px] lg:text-[13px] header-initiative-text leading-tight font-medium text-slate-500 whitespace-nowrap pl-0.5">
            <span>initiative to support</span>
            <span>Ukraine's economy</span>
          </div>
        </div>

        {/* Center: Navigation - Desktop (Version A default) */}
        {!isVersionB && (
          <div className="hidden md:flex flex-none items-center justify-center font-sans antialiased">
              <nav className="flex items-center gap-6 lg:gap-8 min-[1670px]:gap-10">
                <Link href="/about" className={cn(HEADER_NAV_LINK_CLASSNAME, location === '/about' && HEADER_NAV_LINK_ACTIVE_CLASSNAME)}>
                  <span>{t('nav.mission') || 'Mission'}</span>
                </Link>
                <Link
                  href="/#faq"
                  onClick={(e) => {
                    if (location === '/') {
                      e.preventDefault();
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={HEADER_NAV_LINK_CLASSNAME}
                >
                  {t('nav.faq') || 'FAQ'}
                </Link>
              </nav>
          </div>
        )}

        {/* Right: Actions - Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-6 lg:gap-8 min-[1670px]:gap-10 font-sans antialiased">
            {isVersionB ? (
              <div className="flex items-center gap-6 lg:gap-8 min-[1670px]:gap-10">
                <nav className="flex items-center gap-6 lg:gap-8 min-[1670px]:gap-10">
                  <Link href="/about" className={cn(HEADER_NAV_LINK_CLASSNAME, location === '/about' && HEADER_NAV_LINK_ACTIVE_CLASSNAME)}>
                    <span>Project's mission</span>
                  </Link>
                  <Link
                    href="/#faq"
                    onClick={(e) => {
                      if (location === '/') {
                        e.preventDefault();
                        document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={HEADER_NAV_LINK_CLASSNAME}
                  >
                    FAQ
                  </Link>
                </nav>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openAddStoreModal'))}
                  className="group inline-flex items-center gap-1.5 text-[0.9rem] md:text-[0.9rem] lg:text-[15px] xl:text-[15px] min-[1600px]:text-[19px] font-medium text-slate-500 hover:text-[#0057B7] hover:underline hover:decoration-[#0057B7] hover:decoration-1 hover:underline-offset-4 transition-all duration-200 cursor-pointer outline-none whitespace-nowrap bg-transparent p-0"
                >
                  <Plus className="h-4 w-4 stroke-[2.5] text-slate-500 group-hover:text-[#0057B7] transition-colors duration-200" />
                  <span>Add a store</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openAddStoreModal'))}
                className="group inline-flex items-center gap-1.5 text-[0.9rem] md:text-[0.9rem] lg:text-[15px] xl:text-[15px] font-medium text-slate-500 hover:text-[#0057B7] hover:underline hover:decoration-[#0057B7] hover:decoration-1 hover:underline-offset-4 transition-all duration-200 cursor-pointer outline-none whitespace-nowrap bg-transparent p-0"
              >
                <Plus className="h-4 w-4 stroke-[2.5] text-slate-500 group-hover:text-[#0057B7] transition-colors duration-200" />
                <span>{t('nav.addStore') || 'Add a store'}</span>
              </button>
            )}

            <div className="flex items-center gap-3 -ml-2 lg:-ml-3">
              <Link href="/map" className={cn("flex items-center gap-1.5", HEADER_NAV_LINK_CLASSNAME, location === '/map' && HEADER_NAV_LINK_ACTIVE_CLASSNAME)}>
                <MapPin className="w-[0.9rem] h-[0.9rem] lg:w-[0.95rem] lg:h-[0.95rem] min-[1670px]:w-[1.0rem] min-[1670px]:h-[1.0rem] stroke-[2.5]" />
                <span>{t('nav.map') || 'Stores map'}</span>
              </Link>
              <div className="hidden md:block w-[1.5px] h-[22px] bg-slate-300 origin-center" />
              <LanguageSwitcher />
            </div>
        </div>

        {/* Mobile: Map Button + Language Switcher */}
        <div className="flex md:hidden items-center gap-1.5">
          {location === '/map' ? (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openAddStoreModal'))}
              className="no-invert-hover flex items-center justify-center gap-1 min-h-[44px] px-3 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-600 no-underline bg-transparent"
            >
              <Plus className="w-4 h-4 stroke-[2.5] text-slate-500" />
              <span className="text-[14px] font-normal">{t('nav.addStore') || 'Add a store'}</span>
            </button>
          ) : (
            <Link href="/map" className="no-invert-hover flex items-center justify-center gap-1 min-h-[44px] px-3 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-600 no-underline">
              <MapPin className="w-5 h-5 fill-none stroke-current" strokeWidth={2} />
              <span className="text-[14px] font-normal">{t('nav.mapShort') || 'Map'}</span>
            </Link>
          )}

          <LanguageSwitcher className="-mr-0.5" />
        </div>


        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {
        mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg z-40">
            <nav className="flex flex-col p-4 gap-4 antialiased">
              <Link 
                href="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className={cn("text-[16px] transition-colors py-2 tracking-normal flex items-center gap-2", location === '/about' ? "text-slate-800 font-semibold" : "text-slate-500 hover:text-slate-800 font-medium")}
              >
                <span>{t('nav.mission') || 'Mission'}</span>
              </Link>
              <Link
                href="/#faq"
                onClick={(e) => {
                  if (location === '/') {
                    e.preventDefault();
                    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                  }
                  setMobileMenuOpen(false);
                }}
                className="text-[16px] font-medium text-slate-500 hover:text-slate-800 transition-colors py-2 tracking-normal flex items-center gap-2"
              >
                <span>{t('nav.faq') || 'FAQ'}</span>
              </Link>
              <Link 
                href="/map" 
                onClick={() => setMobileMenuOpen(false)}
                className={cn("text-[16px] transition-colors py-2 tracking-normal flex items-center gap-2", location === '/map' ? "text-slate-800 font-semibold" : "text-slate-500 hover:text-slate-800 font-medium")}
              >
                <span>{t('nav.map') || 'Stores map'}</span>
              </Link>
            </nav>
          </div>
        )
      }
    </header >
  );
}
