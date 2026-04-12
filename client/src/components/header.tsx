import { Link, useLocation } from "wouter";
import { Search, Menu, X, ArrowRight, Plus, HelpCircle, MapPin, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
import { useFlagsABTest } from "@/hooks/use-ab-test";
import { LanguageSwitcher } from "@/components/language-switcher";


export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, language, setLanguage } = useI18n();
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
        "sticky top-0 z-50 transition-all duration-500 ease-in-out font-sans",
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-[0_1px_12px_rgba(0,0,0,0.06)]"
          : "bg-white border-b border-slate-200"
      )}
    >
      <div className="boutique-width h-[81px] 2xl:h-[108px] flex items-center justify-between relative">

        {/* Left: Logo & Branding */}
        <div className="flex-1 flex items-center justify-start gap-4">
          <Link href="/" className="flex items-center group min-[1670px]:ml-0 scale-90 min-[1670px]:scale-105 origin-left transition-transform">


            {/* Yellow Vertical Divider */}
            <div className="h-[33.6px] w-[2.1px] bg-[#FFD700] shrink-0 ml-[1.3px]" />

            {/* Branding Text */}
            <div className="flex flex-col justify-center gap-[1.5px] py-px select-none ml-[11.7px]">
              <span className="text-[14.5px] md:text-[15.5px] font-semibold tracking-[-0.045em] text-[#1E293B] opacity-80 whitespace-nowrap leading-[0.94] antialiased">
                Buy Ukrainian
              </span>
              <span className="text-[14.5px] md:text-[15.5px] font-semibold tracking-[-0.045em] text-[#1E293B] opacity-80 whitespace-nowrap leading-[0.94] antialiased">
                in Canada
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Navigation - Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-8">
            <nav className="items-center gap-8 flex font-sans antialiased">
              <Link
                href="/#faq"
                onClick={(e) => {
                  if (location === '/') {
                    e.preventDefault();
                    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group relative text-[15px] min-[1670px]:text-[15.85px] font-medium transition-all duration-300 text-[#0057B7]"
              >
                {t('nav.about') || 'About'}
                <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-[#0057B7] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
              <Link href="/map" className={cn("group relative text-[15px] min-[1670px]:text-[15.85px] transition-all duration-300 flex items-center gap-2 text-[#0057B7]", location === '/map' ? "font-semibold" : "font-medium")}>
                {t('nav.map') || 'Map'}
                <span className={cn("absolute bottom-[2px] left-0 right-0 h-[1px] bg-[#0057B7] transition-transform duration-300 origin-center", location === '/map' ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
              </Link>
              <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                <DialogTrigger asChild>
                  <span
                    role="button"
                    tabIndex={0}
                    className="group relative text-[15px] min-[1670px]:text-[15.85px] font-medium text-[#0057B7] transition-all duration-300 cursor-pointer outline-none flex items-center gap-2"
                  >
                    {t('nav.addStore') || 'Add Store'}
                    <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-[#0057B7] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                  </span>
                </DialogTrigger>
                <DialogContent className="max-w-xl p-0 bg-transparent border-none shadow-none overflow-visible">
                  <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              <LanguageSwitcher />
            </nav>
        </div>
        {/* Mobile: Map Button + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {!isScrolled && location !== '/map' && (
            <Link href="/map" className="no-invert-hover flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-full hover:bg-gray-100 transition-colors text-slate-900 no-underline">
              <MapPin className="w-5 h-5 text-slate-900 fill-none stroke-current" strokeWidth={2} />
              <span className="text-[14px] font-normal">{t('nav.map') || 'Explore the map'}</span>
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

      {/* Mobile Menu Dropdown */}
      {
        mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-50 border-b border-slate-100 shadow-lg z-40">
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
                    className="text-[16px] font-medium text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-tight flex items-center gap-2"
                  >
                    {t('nav.about') || 'About'}
                  </Link>

                  <Link 
                    href="/map" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn("text-[16px] text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-tight flex items-center gap-2", location === '/map' ? "font-semibold" : "font-medium")}
                  >
                    {t('nav.map') || 'Map'}
                  </Link>

                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                        setAddStoreDialogOpen(true);
                        setMobileMenuOpen(false);
                    }}
                    className="text-[16px] font-medium text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-tight flex items-center gap-2 text-left cursor-pointer"
                  >
                    <Plus className="w-4 h-4 opacity-70" />
                    {t('nav.addStore') || 'Add Store'}
                  </span>


            </nav>
          </div>
        )
      }
    </header >
  );
}
