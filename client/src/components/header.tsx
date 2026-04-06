import { Link, useLocation } from "wouter";
import { Search, Menu, X, ArrowRight, Plus, HelpCircle, MapPin, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
import { HeaderPinLogo } from "./header-pin-logo";


export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useI18n();
  const [addStoreDialogOpen, setAddStoreDialogOpen] = useState(false);


  const [variant, setVariant] = useState<'A' | 'B'>((window as any).__VARIANT__ || 'A');

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
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-center group">
            
            <HeaderPinLogo className="h-[44.1px] 2xl:h-[52.5px] w-auto shrink-0 mt-0 overflow-visible" />

            {/* Yellow Vertical Divider */}
            <div className="h-[33.6px] w-[2.1px] bg-[#FFD700] shrink-0 ml-[1px]" />
            
            {variant === 'B' && <span className="text-[13px] mr-1 opacity-80 pl-2">🇺🇦🇨🇦</span>}
            {/* Branding Text */}
            <div className="flex flex-col justify-center gap-[1.5px] py-px select-none ml-[13px]">
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
          {location === '/map' ? (
            <Link href="/" className="group relative text-[15px] min-[1670px]:text-[16px] font-medium text-slate-900/60 hover:text-[#0057B7] transition-all duration-300 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-current transition-colors duration-300" />
              Back to Homepage
              <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-[#FFD700] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
            </Link>
          ) : (
            <nav className="items-center gap-8 flex font-sans antialiased">
              <Link
                href="/#how-it-works"
                onClick={(e) => {
                  if (location === '/') {
                    e.preventDefault();
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group relative text-[15px] min-[1670px]:text-[15.85px] font-medium transition-all duration-300 text-slate-900/60 hover:text-[#0057B7]"
              >
                {t('nav.howItWorks') || 'How it Works'}
                <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-[#FFD700] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
              <Link href="/map" className={cn("group relative text-[15px] min-[1670px]:text-[15.85px] font-medium transition-all duration-300 flex items-center gap-2", location === '/map' ? "text-slate-900" : "text-slate-900/60 hover:text-[#0057B7]")}>
                <MapPin className="w-4 h-4 text-current transition-colors duration-300" />
                {t('nav.map') || 'Map'}
                <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-[#FFD700] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
              <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                <DialogTrigger asChild>
                  <span
                    role="button"
                    tabIndex={0}
                    className="group relative text-[15px] min-[1670px]:text-[15.85px] font-medium text-slate-900/60 hover:text-[#0057B7] transition-all duration-300 cursor-pointer outline-none flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-current transition-colors duration-300" />
                    {t('nav.addStore') || 'Add Store'}
                    <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-[#FFD700] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                  </span>
                </DialogTrigger>
                <DialogContent className="max-w-xl p-0 bg-transparent border-none shadow-none overflow-visible">
                  <HomeAddForm onClose={() => setAddStoreDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </nav>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher />
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

              {location === '/map' ? (
                <Link href="/" className="text-[16px] font-medium text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-tight flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5 opacity-70" />
                  Back to Homepage
                </Link>
              ) : (
                <>
                  <Link
                    href="/#how-it-works"
                    onClick={(e) => {
                      if (location === '/') {
                        e.preventDefault();
                        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="text-[16px] font-medium text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-tight flex items-center gap-2"
                  >
                    {t('nav.howItWorks') || 'How it Works'}
                  </Link>

                  <Link 
                    href="/map" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[16px] font-medium text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-tight flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 opacity-70" />
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
                </>
              )}

              <div className="py-2">
                <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )
      }
    </header >
  );
}
