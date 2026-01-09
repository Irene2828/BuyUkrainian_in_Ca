import { Link, useLocation } from "wouter";
import { Search, Globe, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="sticky top-0 z-50 w-full h-[80px] md:h-[100px] bg-white/80 backdrop-blur-md border-b border-gray-100 font-sans shadow-sm">
      <div className="mx-auto px-4 md:px-[64px] max-w-[1440px] flex items-center h-full relative">

        {/* Left: Logo & Branding */}
        <div className="flex-1 flex items-center transition-all duration-300 ease-in-out">
          <Link href="/" className="flex flex-col items-center gap-0">
            <img
              src="/assets/logonew.png"
              alt="BuyUkrainian.ca"
              className="w-[80px] md:w-[124px] h-auto object-contain"
            />
            <span className="text-[12px] md:text-[16px] font-semibold tracking-[0px] text-black" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              BuyUkrainian.ca
            </span>
          </Link>
        </div>

        {/* Right: Navigation - Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-10">
          <nav className="items-center gap-10 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.location.href = '/#how-it-works';
              }}
              className="text-[16px] font-normal text-black/80 hover:text-black transition-colors tracking-[0px]"
            >
              How it works
            </button>
            <a href="/#faq" className="text-[16px] font-normal text-black/80 hover:text-black transition-colors tracking-[0px]">Project's mission</a>
            <Link href="/about" className="text-[16px] font-normal text-black/80 hover:text-black transition-colors tracking-[0px]">Contacts</Link>
          </nav>

          {/* Globe Icon - Grey default, Black hover */}
          <button className="text-gray-400 hover:text-black transition-all duration-300 ease-in-out">
            <Globe className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Mobile: Map Button + Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/map" className="flex items-center gap-2 py-2 px-4 border border-gray-200 bg-white text-black rounded-full text-[14px] font-semibold active:scale-95 transition-transform hover:bg-gray-50">
            <Search className="w-4 h-4" />
            Map
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-black"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Center: Map view CTA - Desktop only */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center h-full z-[51] pointer-events-none">
          <div className="pointer-events-auto">
            <Link href="/map" className="flex items-center gap-3 py-2 px-4 rounded-full transition-all group">
              <span className="text-[16px] font-bold text-black transition-colors tracking-[0px]" style={{ fontFamily: "'Inter', sans-serif" }}>Map view</span>
              <Search className="w-5 h-5 text-black stroke-[3]" />
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
              className="text-[16px] font-normal text-black/80 hover:text-black transition-colors text-left py-2"
            >
              How it works
            </button>
            <a href="/#faq" className="text-[16px] font-normal text-black/80 hover:text-black transition-colors py-2">Project's mission</a>
            <Link href="/about" className="text-[16px] font-normal text-black/80 hover:text-black transition-colors py-2">Contacts</Link>
            <div className="flex items-center gap-2 py-2 text-gray-400">
              <Globe className="w-5 h-5" />
              <span className="text-[14px]">English</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
