import { Link, useLocation } from "wouter";
import { Search, Menu, X, ArrowRight, Plus, HelpCircle, MapPin, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";


export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useI18n();
  const [addStoreDialogOpen, setAddStoreDialogOpen] = useState(false);


  // Track scroll position for Glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleOpenAddStore = () => {
      setAddStoreDialogOpen(true);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('openAddStore', handleOpenAddStore);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('openAddStore', handleOpenAddStore);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out font-sans",
        "bg-white/90 backdrop-blur-md border-b border-[#C69500]/20"
      )}
    >
      <div className="boutique-width h-[72px] 2xl:h-[96px] flex items-center justify-between relative">

        {/* Left: Logo & Branding */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-center group gap-0 -ml-2">
            <img
              src="/assets/newlogo26.png"
              alt="BuyUkrainian.ca Integrated Crest"
              className="h-10 2xl:h-[54px] w-auto object-contain shrink-0"
            />
            {/* Branding Text */}
            <div className="flex flex-col justify-center h-10 pt-1 -ml-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <span className="header-logo-text text-[17px] 2xl:text-[18px] font-medium tracking-tight text-[#0A2540]/80 leading-none">
                Ukrainian Products
              </span>
              <span className="header-logo-text text-[15px] 2xl:text-[16px] font-medium tracking-tight text-[#0A2540]/80 leading-none mt-[3px] italic">
                in Canada
              </span>
            </div>

          </Link>
        </div>

        {/* Right: Navigation - Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-8">
          {location === '/map' ? (
            <Link href="/" className="group relative text-[15px] font-medium text-slate-900 opacity-70 hover:opacity-100 transition-all duration-300 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Homepage
              <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
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
                className="group relative text-[15px] font-medium transition-all duration-300 hover:opacity-100 text-slate-900 opacity-70"
              >
                {t('nav.about') || 'About'}
                <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
              <Link href="/map" className={cn("group relative text-[15px] font-medium transition-all duration-300 hover:opacity-100 flex items-center gap-2", location === '/map' ? "text-slate-900 opacity-100" : "text-slate-900 opacity-70")}>
                <MapPin className="w-4 h-4 opacity-90" />
                {t('nav.map') || 'View Map'}
                <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
              <Dialog open={addStoreDialogOpen} onOpenChange={setAddStoreDialogOpen}>
                <DialogTrigger asChild>
                  <span
                    role="button"
                    tabIndex={0}
                    className="group relative text-[15px] font-medium text-slate-900 opacity-70 hover:opacity-100 transition-all duration-300 cursor-pointer outline-none flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 opacity-90" />
                    {t('nav.addStore') || 'Add a Store'}
                    <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                  </span>
                </DialogTrigger>
                <DialogContent className="max-w-xl p-0 bg-transparent border-none shadow-none">
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
                    {t('nav.about') || 'About'}
                  </Link>

                  <Link href="/map" className="text-[16px] font-medium text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-tight flex items-center gap-2">
                    <MapPin className="w-4 h-4 opacity-70" />
                    {t('nav.map') || 'View Map'}
                  </Link>

                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => setAddStoreDialogOpen(true)}
                    className="text-[16px] font-medium text-slate-800 hover:text-slate-900 transition-colors py-2 tracking-tight flex items-center gap-2 text-left cursor-pointer"
                  >
                    <Plus className="w-4 h-4 opacity-70" />
                    Add a Store
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
