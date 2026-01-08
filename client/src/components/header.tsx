import { Link, useLocation } from "wouter";
import { Search, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="relative z-40 w-full h-[100px] bg-white border-none font-sans">
      <div className="mx-auto px-[64px] max-w-[1440px] flex items-center h-full relative">

        {/* Left: Logo & Branding - Stacked Layout with Text */}
        <div className="flex-1 flex items-center transition-all duration-300 ease-in-out">
          <Link href="/" className="flex flex-col items-center gap-0">
            <img
              src="/assets/logonew.png"
              alt="BuyUkrainian.ca"
              className="w-[124px] h-auto object-contain"
            />
            <span className="text-[16px] font-semibold tracking-[0px] text-black" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
              BuyUkrainian.ca
            </span>
          </Link>
        </div>

        {/* Right: Navigation - Inter 16px Regular */}
        <div className="flex-1 flex items-center justify-end gap-10">
          <nav className="items-center gap-10 hidden lg:flex" style={{ fontFamily: "'Inter', sans-serif" }}>
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

        {/* Center: Map view CTA - Inter 16px Bold - Baseline aligned */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center h-full z-[51] pointer-events-none">
          <div className="pointer-events-auto">
            <Link href="/map" className="flex items-center gap-3 py-2 px-4 rounded-full transition-all group">
              <span className="text-[16px] font-bold text-black transition-colors tracking-[0px]" style={{ fontFamily: "'Inter', sans-serif" }}>Map view</span>
              <Search className="w-5 h-5 text-black stroke-[3]" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
