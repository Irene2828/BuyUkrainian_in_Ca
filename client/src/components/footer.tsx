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
    <footer className="bg-slate-900 text-[#fafafa] font-sans overflow-hidden relative py-[clamp(4rem,8vh,8rem)]">
      <div className="boutique-width w-full flex flex-col items-center gap-12">

        {/* Line Divider above links */}
        <div className="w-full border-t border-[#C69500]/15" />

        {/* Top Row: Links & Actions */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-10">

          {/* 3 Columns Layout for Links (Horizontal) */}
          <div className="flex flex-row items-center gap-8 md:gap-12">
            <AccessibilityToggle className="text-[13px] font-normal text-white/60 hover:text-white/90 transition-colors duration-200 uppercase tracking-widest" />

            <a
              href="mailto:hello@buyukrainian.ca"
              className="text-[13px] font-normal text-white/60 hover:text-white/90 transition-colors duration-200 no-underline uppercase tracking-widest"
            >
              CONTACT
            </a>

            <Link
              href="/privacy"
              className="text-[13px] font-normal text-white/60 hover:text-white/90 transition-colors duration-200 no-underline uppercase tracking-widest"
            >
              PRIVACY POLICY
            </Link>
          </div>

          {/* Right Side: Admin & Scroll To Top */}
          <div className="flex items-center gap-8">
            <Link
              href="/admin/login"
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-[0.2em] whitespace-nowrap"
            >
              Admin access
            </Link>

            <button
              onClick={scrollToTop}
              className="group flex items-center justify-center w-11 h-11 rounded-full border border-white/10 hover:border-white/20 transition-all hover:bg-white/5"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Perfectly Centered Copyright Section (Divider removed from here) */}
        <div className="w-full pt-8 flex justify-center">
          <span
            className="text-[12px] font-normal text-[#C69500]/50 tracking-[0.02em] text-center flex items-center justify-center gap-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Copyright © 2026 BuyUkrainian.ca. All rights reserved
          </span>
        </div>
      </div>
    </footer>
  );
}
