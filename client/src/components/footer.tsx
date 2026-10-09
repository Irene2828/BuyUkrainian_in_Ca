import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { LegalModal } from "./legal-modals";

export function Footer() {
  const { t, language } = useI18n();
  const [location] = useLocation();
  const [modalType, setModalType] = useState<"terms" | "privacy" | "accessibility" | null>(null);

  const isFr = language === 'fr-CA';

  return (
    <>
    <footer className="bg-[#00377D] text-[#E2E8F0] font-sans overflow-hidden py-8 md:py-12 antialiased">
      <div className="boutique-width">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 lg:gap-16 pl-2 md:pl-6 lg:pl-8 pr-2 md:pr-6 lg:pr-8">
          
          {/* Left Anchor: Brand & Mission */}
          <div className="flex flex-col items-start justify-start">
            <span className="text-[13px] font-normal tracking-wide text-[#E2E8F0]/70 antialiased">
              © 2026 BuyUkrainian.ca
            </span>
          </div>

          {/* Right Anchor: Navigation Columns */}
          <div className="flex flex-col gap-6 items-start md:items-end">
            
            <div className="flex flex-col items-start md:items-end">
              {/* Decor Lines */}
              <div className="flex flex-col gap-1.5 pointer-events-none mb-6 items-start md:items-end" aria-hidden="true">
                <div className="h-[1px] w-[192px] bg-[#FFD700]" />
                <div className="h-[1px] w-[72px] bg-[#FFD700]" />
              </div>

              <div className="flex flex-col sm:flex-row gap-16 md:gap-24 w-full md:w-auto justify-start md:justify-end">
                {/* Contact Column */}
                <div className="flex flex-col items-start justify-start">
                  <nav className="flex flex-col gap-2.5 md:items-end" aria-label="Contact Links">
                    <a 
                      href="#" 
                      onClick={(e) => e.preventDefault()}
                      className="text-[15px] footer-link-text font-medium tracking-normal text-[#E2E8F0]/50 cursor-not-allowed transition-colors duration-200"
                    >
                      {isFr ? 'Nous écrire' : 'Email Us'}
                    </a>
                  </nav>
                </div>

                {/* Legal Column */}
                <div className="flex flex-col items-start justify-start">
                  <nav className="flex flex-col gap-2.5 md:items-end text-left md:text-right" aria-label="Legal Links">
                    <button 
                      onClick={() => setModalType("terms")}
                      className="text-[15px] footer-link-text text-left md:text-right font-medium tracking-normal text-[#E2E8F0] hover:text-[#FFD700] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/20 p-0 h-auto bg-transparent border-none cursor-pointer"
                    >
                      {isFr ? 'Conditions et politique des fiches' : 'Terms & Listing Policy'}
                    </button>
                    <a 
                      href="/privacy"
                      className="text-[15px] footer-link-text text-left md:text-right font-medium tracking-normal text-[#E2E8F0] hover:text-[#FFD700] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/20 p-0 h-auto bg-transparent border-none cursor-pointer"
                    >
                      {isFr ? 'Confidentialité' : 'Privacy'}
                    </a>
                    <button 
                      onClick={() => setModalType("accessibility")}
                      className="text-[15px] footer-link-text text-left md:text-right font-medium tracking-normal text-[#E2E8F0] hover:text-[#FFD700] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/20 p-0 h-auto bg-transparent border-none cursor-pointer"
                    >
                      {isFr ? 'Accessibilité' : 'Accessibility'}
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>

    <LegalModal 
      open={modalType !== null} 
      onOpenChange={(open) => !open && setModalType(null)} 
      type={modalType} 
    />
    </>
  );
}
