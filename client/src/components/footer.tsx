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
    <footer className="bg-slate-900 text-[#fafafa] font-sans overflow-hidden relative pt-[clamp(5rem,10vh,10rem)] pb-[clamp(3rem,6vh,6rem)]">
      <div className="boutique-width w-full flex flex-col items-stretch gap-16">

        <div className="w-full">
          {/* Top Row: Links & Actions */}
          <div className="w-full flex flex-col gap-10 md:flex-row md:items-center md:justify-between">

            {/* 3 Columns Layout for Links (Horizontal) */}
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8 md:gap-12">
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
            <div className="flex items-center gap-8 md:justify-end">
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
        </div>

        {/* Footer Microcopy */}
        <div className="w-full pt-12 flex justify-center text-center">
          <div className="text-center">
            <span
              className="text-[12px] font-normal text-white/35 tracking-[0.02em]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Copyright © 2026 BuyUkrainian.ca. Volunteer initiative to support Ukraine from Canada
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
