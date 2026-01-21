import { Link, useLocation } from "wouter";
import { Search, Menu, X } from "lucide-react";
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
      "sticky top-0 z-50 w-full h-[80px] md:h-[100px] bg-white/80 backdrop-blur-md font-sans transition-all duration-300",
      isScrolled && "border-b border-slate-100"
    )}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-full relative">

        {/* Left: Logo & Branding */}
        <div className="flex-1 flex items-center transition-all duration-300 ease-in-out">
          <Link href="/" className="flex flex-col items-start md:items-center gap-0">
            {/* Logo Flag - Blue #0066FF, Yellow #FEEF1A at 90% opacity */}
            <div
              className="overflow-hidden"
              style={{
                width: '124px',
                height: '46px',
                borderRadius: '0'
              }}
            >
              <div style={{ width: '100%', height: '50%', backgroundColor: '#0066FF', opacity: 0.9 }} />
              <div style={{ width: '100%', height: '50%', backgroundColor: '#FEEF1A', opacity: 0.9 }} />
            </div>
            <span className="text-[12px] md:text-[16px] font-semibold tracking-[0px] text-[#003E82]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              BuyUkrainian.ca
            </span>
          </Link>
        </div>

        {/* Right: Navigation - Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-10">
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
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.location.href = '/#how-it-works';
              }}
              className="no-invert-hover text-[16px] font-normal text-slate-600 hover:text-slate-950 transition-colors duration-300 leading-[26px] tracking-[-0.44px]"
            >
              Support
            </button>
          </nav>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>

        {/* Mobile: Map Button + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/map" className="no-invert-hover flex items-center gap-2 py-2 text-black no-underline">
            <Search className="w-5 h-5 text-black fill-none stroke-current" strokeWidth={2} />
            <span className="text-[14px] font-semibold">{t('map.viewMap') || 'View Map'}</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="no-invert-hover p-2 text-black"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 fill-none stroke-current" strokeWidth={2} /> : <Menu className="w-6 h-6 fill-none stroke-current" strokeWidth={2} />}
          </button>
        </div>

        {/* Center: Map view CTA - Desktop only */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-full z-[51] pointer-events-none">
          <div className="pointer-events-auto">
            <Link href="/map" className="flex items-center gap-3 py-2 px-4 rounded-full transition-all group">
              <span className="text-[16px] font-bold text-black transition-colors tracking-[0px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                {t('map.viewMap') || 'View Map'}
              </span>
              <Search className="w-5 h-5 text-black fill-none stroke-current stroke-[3]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-40">
          <nav className="flex flex-col p-4 gap-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.location.href = '/#how-it-works';
              }}
              className="no-invert-hover text-[16px] font-medium text-slate-500 hover:text-slate-950 transition-colors duration-300 text-left py-2 tracking-tight"
            >
              {t('header.howItWorks') || 'How It Works'}
            </button>
            <a href="/#faq" className="text-[16px] font-medium text-slate-500 hover:text-slate-950 transition-colors duration-300 py-2 tracking-tight">
              {t('header.faq') || 'FAQ'}
            </a>
            <Link href="/about" className="text-[16px] font-medium text-slate-500 hover:text-slate-950 transition-colors duration-300 py-2 tracking-tight">
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
