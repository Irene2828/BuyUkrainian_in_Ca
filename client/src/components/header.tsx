import { Link, useLocation } from "wouter";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useI18n();

  // Track scroll position for border effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={cn(
      "sticky top-0 z-[100] w-full h-auto font-sans transition-all duration-500 ease-in-out py-1",
      isScrolled
        ? "bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_-12px_rgba(0,0,0,0.1)] border-b border-slate-200/50"
        : "bg-white border-b border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-full relative">

        {/* Left: Logo & Branding */}
        <div className="flex-1 flex items-center transition-all duration-300 ease-in-out">
          <Link href="/" className="flex items-center">
            <img
              src="/assets/logo-final.png"
              alt="BuyUkrainian.ca"
              className="w-[190px] h-[90px] object-contain"
            />
          </Link>
        </div>

        {/* Right: Navigation - Desktop (Hidden on Scroll) */}
        {!isScrolled && (
          <div className="hidden md:flex flex-1 items-center justify-end gap-10 animate-in fade-in duration-500">
            <nav className="items-center gap-10 flex font-ui">
              <Link
                href="/about"
                className="text-[16px] font-normal text-slate-600 hover:text-slate-950 transition-colors duration-300 leading-[26px] tracking-[-0.44px]"
              >
                {t('header.about.short') || 'About'}
              </Link>
              <a
                href="/#faq"
                className="text-[16px] font-normal text-slate-600 hover:text-slate-950 transition-colors duration-300 leading-[26px] tracking-[-0.44px]"
              >
                {t('header.faq') || 'FAQ'}
              </a>
              <Link
                href="/about"
                className="text-[16px] font-normal text-slate-600 hover:text-slate-950 transition-colors duration-300 leading-[26px] tracking-[-0.44px]"
              >
                Contact
              </Link>
            </nav>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
        )}

        {/* Mobile: Map Button + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {!isScrolled && location !== '/map' && (
            <Link href="/map" className="no-invert-hover flex items-center gap-2 py-2 text-black no-underline">
              <Search className="w-5 h-5 text-black fill-none stroke-current" strokeWidth={2} />
              <span className="text-[14px] font-semibold">{t('header.exploreMap') || 'Explore the map'}</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="no-invert-hover p-2 text-black"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 fill-none stroke-current" strokeWidth={2} /> : <Menu className="w-6 h-6 fill-none stroke-current" strokeWidth={2} />}
          </button>
        </div>

        {/* Center: Dynamic view CTA - Desktop only - Shown ONLY on Scroll */}
        {isScrolled && (
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-full z-[51] pointer-events-none">
            <div className="pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-500">
              {location === '/map' ? (
                <Link href="/" className="flex items-center gap-2 group">
                  <ArrowRight className="w-5 h-5 text-black fill-none stroke-current transition-transform duration-300 rotate-180 group-hover:-translate-x-1" strokeWidth={2} />
                  <span className="text-[16px] font-bold text-black transition-colors tracking-tight font-ui">
                    Back to Homepage
                  </span>
                </Link>
              ) : (
                <Link href="/map" className="flex items-center gap-2.5 group">
                  <span className="text-[16px] font-bold text-black transition-colors tracking-tight font-ui">
                    View Map
                  </span>
                  <Search className="w-5 h-5 text-black fill-none stroke-current stroke-[2.5] group-hover:scale-110 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-40">
          <nav className="flex flex-col p-4 gap-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Link
              href="/about"
              className="no-invert-hover text-[16px] font-medium text-[#0D4276] hover:text-slate-950 transition-colors duration-300 text-left py-2 tracking-tight"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <a href="/#faq" className="text-[16px] font-medium text-[#0D4276] hover:text-slate-950 transition-colors duration-300 py-2 tracking-tight">
              {t('header.faq') || 'FAQ'}
            </a>
            <Link href="/about" className="text-[16px] font-medium text-[#0D4276] hover:text-slate-950 transition-colors duration-300 py-2 tracking-tight">
              {t('header.about.short') || 'About'}
            </Link>
            <div className="py-2">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
