import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { AccessibilityToggle } from "@/components/ui/accessibility-toggle";

export function Footer() {
  const { t } = useI18n();
  const [location] = useLocation();

  return (
    <footer className="bg-[#00387b] text-[#E2E8F0] font-sans overflow-hidden py-8 md:py-12 antialiased">
      <div className="content-width">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Anchor: Brand & Mission */}
          <div className="md:col-span-4 flex flex-col items-start justify-start">
            <span className="text-[13px] font-normal tracking-wide text-[#E2E8F0]/70 antialiased">
              © 2026 BuyUkrainian.ca
            </span>
          </div>

          {/* Right Anchor: Navigation Columns */}
          <div className="md:col-span-8 flex flex-col sm:flex-row gap-16 md:justify-end">
            
            {/* CONTACT Cluster */}
            <div className="flex flex-col items-start justify-start gap-4">
              <h3 className="text-[#FFD700] text-[12px] font-bold uppercase tracking-[0.2em] opacity-90">
                Contact
              </h3>
              <nav className="flex flex-col gap-2.5" aria-label="Contact Links">
                <a 
                  href="mailto:hello@buyukrainian.ca" 
                  className="text-[15px] font-medium tracking-tight text-[#E2E8F0] hover:text-[#FFD700] transition-colors duration-200"
                >
                  Email Us
                </a>
              </nav>
            </div>

            {/* LEGAL Cluster */}
            <div className="flex flex-col items-start justify-start gap-4">
              <h3 className="text-[#FFD700] text-[12px] font-bold uppercase tracking-[0.2em] opacity-90">
                Legal
              </h3>
              <nav className="flex flex-col gap-2.5" aria-label="Legal Links">
                <Link 
                  href="/privacy" 
                  className="text-[15px] font-medium tracking-tight text-[#E2E8F0] hover:text-[#FFD700] transition-colors duration-200"
                >
                  {t('common.labels.privacyPolicy') || 'Privacy Policy'}
                </Link>
                <div className="flex items-center">
                  <AccessibilityToggle className="text-[15px] font-medium tracking-tight text-[#E2E8F0] hover:text-[#FFD700] p-0 h-auto bg-transparent border-none transition-colors duration-200 cursor-pointer" />
                </div>
                <Link 
                  href="/admin/login" 
                  className="text-[15px] font-medium tracking-tight text-[#E2E8F0] hover:text-[#FFD700] transition-colors duration-200"
                >
                  {t('common.labels.adminAccess') || 'Admin Access'}
                </Link>
              </nav>
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
}
