import { Link, useLocation } from "wouter";
import { Search, Menu, X, ArrowRight, Plus, HelpCircle } from "lucide-react";
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "w-full z-[100] h-auto font-sans py-1 transition-all duration-300 border-b-0 border-transparent relative bg-transparent"
      )}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16 flex items-center justify-between h-full relative">

        {/* Left: Logo & Branding */}
        <div className="flex-1 flex items-center transition-all duration-300 ease-in-out">
          <Link href="/" className="flex items-center">
            <img
              src="/assets/logo-final.png"
              alt="BuyUkrainian.ca"
              className="w-[190px] h-[90px] object-contain mix-blend-multiply"
            />
          </Link>
        </div>

        {/* Right: Navigation - Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-8">
          <nav className="items-center gap-8 flex font-sans">
            <Link href="/about" className={cn("group relative text-[15px] font-medium transition-colors hover:text-slate-900", location === '/about' ? "text-slate-900" : "text-slate-800")}>
              About
              <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
            </Link>
            <a href="/#faq" className="group relative text-[15px] font-medium text-slate-800 hover:text-slate-900 transition-colors">
              FAQ
              <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
            </a>
            <a href="mailto:hello@buyukrainian.ca" className="group relative text-[15px] font-medium text-slate-800 hover:text-slate-900 transition-colors">
              Contact
              <span className="absolute bottom-[2px] left-0 right-0 h-[1px] bg-current scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
            </a>
          </nav>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>

        {/* Mobile: Map Button + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          {!isScrolled && location !== '/map' && (
            <Link href="/map" className="no-invert-hover flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-full hover:bg-gray-100 transition-colors text-slate-900 no-underline">
              <Search className="w-5 h-5 text-slate-900 fill-none stroke-current" strokeWidth={2} />
              <span className="text-[14px] font-semibold">{t('header.exploreMap') || 'Explore the map'}</span>
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-40">
            <nav className="flex flex-col p-4 gap-4" style={{ fontFamily: "'Inter', sans-serif" }}>

              <a href="/#faq" className="text-[16px] font-medium text-[#0D4276] hover:text-slate-900 transition-colors duration-300 py-2 tracking-tight flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Help
              </a>

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
