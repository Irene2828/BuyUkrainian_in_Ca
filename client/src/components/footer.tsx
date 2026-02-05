import { Link } from "wouter";
import { AccessibilityToggle } from "@/components/ui/accessibility-toggle";
import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-slate-900 text-[#fafafa] font-sans overflow-hidden relative" style={{ paddingTop: '80px', paddingBottom: '10%' }}>
      <div className="boutique-width w-full flex items-end justify-between h-full">
        {/* Left Side: Utility Stacking */}
        <div className="flex flex-col items-start gap-1">
          <AccessibilityToggle className="text-[11px] font-semibold text-white/70 hover:opacity-100 transition-opacity duration-200 min-h-[32px] flex items-center tracking-[0.1em] uppercase" />

          <a
            href="mailto:hello@buyukrainian.ca"
            className="text-[11px] font-semibold text-white/70 hover:opacity-100 transition-opacity duration-200 no-underline min-h-[32px] flex items-center tracking-[0.1em] uppercase"
          >
            CONTACT
          </a>

          <Link
            href="/privacy"
            className="text-[11px] font-semibold text-white/70 hover:opacity-100 transition-opacity duration-200 no-underline min-h-[32px] flex items-center tracking-[0.1em] uppercase"
          >
            PRIVACY POLICY
          </Link>
        </div>

        {/* Right Side: Admin & Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/admin/login"
            className="text-[10px] text-white/40 hover:text-white/60 transition-colors uppercase tracking-[0.1em] whitespace-nowrap"
          >
            Admin access
          </Link>

          <button
            onClick={scrollToTop}
            className="group flex items-center justify-center w-11 h-11 rounded-full border border-white/10 hover:border-white/20 transition-all hover:bg-white/5 scale-90 md:scale-100"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Centered Copyright Section */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ width: '288.22px', height: '16.5px' }}
      >
        <span
          className="absolute left-[calc(50%-232px/2-0.11px)] top-[1px]"
          style={{
            width: '232px',
            height: '17px',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: '11px',
            lineHeight: '16px',
            letterSpacing: '0.0644531px',
            color: '#62748E',
            whiteSpace: 'nowrap',
            textAlign: 'center'
          }}
        >
          Copyright © 2026 BuyUkrainian.ca. All rights reserved
        </span>
      </div>
    </footer>
  );
}
