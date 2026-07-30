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

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useI18n();
  const { isVersionB } = useFlagsABTest();


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
      <div className="boutique-width h-[73px] relative z-10">
        <div className="flex h-full items-center justify-between">

        {/* Left: Logo & Branding */}
        <div className="flex-1 flex items-center justify-start gap-1.5">
          <Link href="/" className="flex items-center group -ml-8 min-[1024px]:-ml-10 min-[1670px]:-ml-12 -mr-3 min-[1024px]:-mr-[23px] min-[1670px]:-mr-6">
            <img 
              src={logoJuly29} 
              alt="BuyUkrainian.ca" 
              className="h-[135.14px] min-[1024px]:h-[139.94px] min-[1670px]:h-[162.92px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" 
            />
          </Link>
          <div className="hidden lg:block w-[1.5px] h-[22px] bg-slate-300 transform skew-x-[-20deg] origin-center" />
          <span className="hidden lg:block ml-1 text-[14.28px] min-[1024px]:max-[1440px]:text-[15.3px] min-[1670px]:text-[17.69px] text-slate-500 font-normal tracking-wide leading-none antialiased font-sans">
            {t('siteHeader.volunteerInitiative') || "Volunteer initiative to support Ukraine's economy"}
          </span>
        </div>

        {/* Right: Navigation - Desktop */}
        <div className="hidden md:flex flex-none items-center justify-end gap-6 lg:gap-8 font-sans antialiased">
            <nav className="flex items-center gap-6 lg:gap-8">
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
                {t('nav.about') || 'About'}
              </Link>
              <Link href="/map" className={cn("flex items-center gap-1.5", HEADER_NAV_LINK_CLASSNAME, location === '/map' && HEADER_NAV_LINK_ACTIVE_CLASSNAME)}>
                <Map className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('nav.map') || 'Map'}</span>
              </Link>
            </nav>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => window.dispatchEvent(new CustomEvent('openAddStoreModal'))}
                  className={cn("cursor-pointer outline-none flex items-center gap-1", HEADER_NAV_LINK_CLASSNAME)}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t('nav.addStore') || 'Add Stores'}</span>
                </span>
            <div className="flex items-center gap-3 -ml-2 lg:-ml-3">
              <div className="hidden md:block w-[1.5px] h-[22px] bg-slate-300 transform skew-x-[-20deg] origin-center" />
              <LanguageSwitcher />
            </div>
        </div>
        {/* Mobile: Map Button + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {location === '/map' ? (
            <Link href="/" className="no-invert-hover flex items-center justify-center min-h-[44px] px-3 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800 no-underline">
              <span className="text-[14px] font-normal">{t('nav.home')}</span>
            </Link>
          ) : (
            <Link href="/map" className="no-invert-hover flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800 no-underline">
              <Map className="w-5 h-5 fill-none stroke-current" strokeWidth={2} />
              <span className="text-[14px] font-normal">{t('nav.map') || 'Map View'}</span>
            </Link>
          )}


          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="no-invert-hover flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 fill-none stroke-current" strokeWidth={2} /> : <Menu className="w-6 h-6 fill-none stroke-current" strokeWidth={2} />}
          </button>
        </div>


        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {
        mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-lg z-40">
            <nav className="flex flex-col p-4 gap-4 antialiased">

              {location === '/map' && (
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[16px] font-medium text-slate-500 hover:text-slate-800 transition-colors py-2 tracking-normal flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>{t('nav.home') || 'Home'}</span>
                </Link>
              )}
              <Link
                    href="/#faq"
                    onClick={(e) => {
                      if (location === '/') {
                        e.preventDefault();
                        document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="text-[16px] font-medium text-slate-500 hover:text-slate-800 transition-colors py-2 tracking-normal flex items-center gap-2"
                  >
                    {t('nav.about') || 'About'}
                  </Link>

                  <Link 
                    href="/map" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn("text-[16px] transition-colors py-2 tracking-normal flex items-center gap-2", location === '/map' ? "text-slate-800 font-semibold" : "text-slate-500 hover:text-slate-800 font-medium")}
                  >
                    <Map className="w-4 h-4" />
                    <span>{t('nav.map') || 'Map View'}</span>
                  </Link>

                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('openAddStoreModal'));
                        setMobileMenuOpen(false);
                    }}
                    className="text-[16px] font-medium text-slate-500 hover:text-slate-800 transition-colors py-2 tracking-normal flex items-center justify-between gap-2 text-left cursor-pointer"
                  >
                    Add Stores
                    <Plus className="w-4 h-4 opacity-70" />
                  </span>

                  <div className="pt-2 border-t border-slate-200/80">
                    <LanguageSwitcher />
                  </div>


            </nav>
          </div>
        )
      }
    </header >
  );
}
