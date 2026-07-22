import { Link, useLocation } from "wouter";
import { Search, Menu, X, ArrowRight, Plus, HelpCircle, MapPin, ArrowLeft, Map } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
import { useFlagsABTest } from "@/hooks/use-ab-test";
import { LanguageSwitcher } from "@/components/language-switcher";
import { GoogleMapsProvider } from "@/components/google-maps-provider";
import { HEADER_NAV_LINK_ACTIVE_CLASSNAME, HEADER_NAV_LINK_CLASSNAME } from "@/components/nav-link-styles";

import newLogo from "@/assets/newlogo.png";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useI18n();
  const [addStoreDialogOpen, setAddStoreDialogOpen] = useState(false);
  const { isVersionB } = useFlagsABTest();


  const [, setVariant] = useState<'A' | 'B'>((window as any).__VARIANT__ || 'A');

  // Track scroll position for Glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleOpenAddStore = () => {
      setAddStoreDialogOpen(true);
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
    window.addEventListener('openAddStore', handleOpenAddStore);
    window.addEventListener('openAddStoreModal', handleOpenAddStore);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('openAddStore', handleOpenAddStore);
      window.removeEventListener('openAddStoreModal', handleOpenAddStore);
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
        <div className="flex-1 flex items-center justify-start gap-2">
          <Link href="/" className="flex items-center group min-[1670px]:ml-0">
            {/* Branding Text with Oval Frame */}
            <div className="relative flex flex-col justify-center gap-[1.5px] min-[1670px]:gap-[2px] px-[18px] py-[9px] min-[1024px]:max-[1440px]:px-[19px] min-[1024px]:max-[1440px]:py-[9.5px] min-[1670px]:px-[21px] min-[1670px]:py-[10px] select-none">
              {/* Split-color Oval Stroke Frame */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none p-[1.5px]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <clipPath id="clip-top" clipPathUnits="objectBoundingBox">
                    <rect x="-0.05" y="-0.05" width="1.1" height="0.55" />
                  </clipPath>
                  <clipPath id="clip-bottom" clipPathUnits="objectBoundingBox">
                    <rect x="-0.05" y="0.5" width="1.1" height="0.55" />
                  </clipPath>
                </defs>
                <rect x="0.75" y="0.75" width="100%" height="100%" rx="999" ry="999" stroke="#0057B7" strokeWidth="1.5" fill="none" clipPath="url(#clip-top)" style={{ width: 'calc(100% - 1.5px)', height: 'calc(100% - 1.5px)' }} />
                <rect x="0.75" y="0.75" width="100%" height="100%" rx="999" ry="999" stroke="#FFD700" strokeWidth="1.5" fill="none" clipPath="url(#clip-bottom)" style={{ width: 'calc(100% - 1.5px)', height: 'calc(100% - 1.5px)' }} />
              </svg>
              <span className="text-[11.7px] md:text-[12.75px] min-[1024px]:max-[1440px]:text-[13.75px] min-[1670px]:text-[15.75px] font-medium tracking-[-0.045em] text-[#1E293B] opacity-90 whitespace-nowrap leading-[0.94] antialiased">
                Buy Ukrainian
              </span>
              <span className="text-[11.7px] md:text-[12.75px] min-[1024px]:max-[1440px]:text-[13.75px] min-[1670px]:text-[15.75px] font-medium tracking-[-0.045em] text-[#1E293B] opacity-90 whitespace-nowrap leading-[0.94] antialiased">
                in Canada
              </span>
            </div>
          </Link>
          <div className="hidden lg:block w-[1px] h-[22px] bg-slate-200/80" />
          <span className="hidden lg:block text-[14px] min-[1024px]:max-[1440px]:text-[15px] min-[1670px]:text-[17px] text-slate-500 font-medium tracking-wide leading-none antialiased font-['Inter']">
            Volunteer initiative to support Ukraine from Canada
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
                {t('nav.about') || 'Mission'}
              </Link>
              <Link href="/map" className={cn("flex items-center gap-1.5", HEADER_NAV_LINK_CLASSNAME, location === '/map' && HEADER_NAV_LINK_ACTIVE_CLASSNAME)}>
                <Map className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('nav.map') || 'Map'}</span>
              </Link>
            </nav>
            <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
              <DialogTrigger asChild>
                <span
                  role="button"
                  tabIndex={0}
                  className={cn("cursor-pointer outline-none flex items-center gap-1", HEADER_NAV_LINK_CLASSNAME)}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Stores</span>
                </span>
              </DialogTrigger>
              <DialogContent className="max-w-xl p-0 bg-transparent border-none shadow-none overflow-visible">
                <GoogleMapsProvider>
                  <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
                </GoogleMapsProvider>
              </DialogContent>
            </Dialog>
            <div className="flex items-center gap-5 lg:gap-6 pl-1 border-l border-slate-200/80">
              <LanguageSwitcher />
            </div>
        </div>
        {/* Mobile: Map Button + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {location !== '/map' && (
            <Link href="/map" className="no-invert-hover flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-full hover:bg-gray-100 transition-colors text-slate-900 no-underline">
              <Map className="w-5 h-5 text-slate-900 fill-none stroke-current" strokeWidth={2} />
              <span className="text-[14px] font-normal">{t('nav.map') || 'Map View'}</span>
            </Link>
          )}


          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="no-invert-hover flex items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-full hover:bg-gray-100 transition-colors text-slate-900"
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
            <nav className="flex flex-col p-4 gap-4 antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>

              <Link
                    href="/#faq"
                    onClick={(e) => {
                      if (location === '/') {
                        e.preventDefault();
                        document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="text-[16px] font-medium text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-normal flex items-center gap-2"
                  >
                    {t('nav.about') || 'Mission'}
                  </Link>

                  <Link 
                    href="/map" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn("text-[16px] text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-normal flex items-center gap-2", location === '/map' ? "font-semibold" : "font-medium")}
                  >
                    <Map className="w-4 h-4" />
                    <span>{t('nav.map') || 'Map View'}</span>
                  </Link>

                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                        setAddStoreDialogOpen(true);
                        setMobileMenuOpen(false);
                    }}
                    className="text-[16px] font-medium text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-normal flex items-center justify-between gap-2 text-left cursor-pointer"
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
