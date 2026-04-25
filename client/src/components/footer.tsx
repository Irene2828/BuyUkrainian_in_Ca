import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { AccessibilityToggle } from "@/components/ui/accessibility-toggle";

export function Footer() {
  const { t } = useI18n();
  const [location] = useLocation();

  return (
    <footer className="bg-slate-900 text-slate-100 font-sans overflow-hidden py-16 md:py-24 antialiased">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Anchor: Brand & Mission */}
          <div className="md:col-span-6 flex flex-col items-start justify-start">
            <p className="text-xl md:text-2xl font-medium leading-tight max-w-md mb-12 text-white">
              Volunteer initiative to support Ukraine from Canada
            </p>
            <span className="text-base font-normal tracking-wide text-slate-300 mt-auto">
              © 2026 BuyUkrainian.ca
            </span>
          </div>

          {/* Right Anchor: Navigation Columns */}
          <div className="md:col-span-6 flex flex-col sm:flex-row gap-16 md:justify-end">
            
            {/* CONTACT Cluster */}
            <div className="flex flex-col items-start justify-start gap-6">
              <h3 className="text-white text-base font-bold uppercase tracking-[0.1em]">
                Contact
              </h3>
              <nav className="flex flex-col gap-4 text-lg" aria-label="Contact Links">
                <a 
                  href="mailto:hello@buyukrainian.ca" 
                  className="text-slate-100 hover:text-white transition-all duration-200 focus-visible:ring-offset-slate-900 border-b border-transparent hover:border-white pb-0.5"
                >
                  Email Us
                </a>
              </nav>
            </div>

            {/* LEGAL Cluster */}
            <div className="flex flex-col items-start justify-start gap-6">
              <h3 className="text-white text-base font-bold uppercase tracking-[0.1em]">
                Legal
              </h3>
              <nav className="flex flex-col gap-4 text-lg" aria-label="Legal Links">
                <Link 
                  href="/privacy" 
                  className="text-slate-100 hover:text-white transition-all duration-200 focus-visible:ring-offset-slate-900 border-b border-transparent hover:border-white pb-0.5"
                >
                  {t('common.labels.privacyPolicy') || 'Privacy Policy'}
                </Link>
                <div className="flex items-center">
                  <AccessibilityToggle className="text-slate-100 hover:text-white p-0 h-auto bg-transparent border-none text-lg transition-all duration-200 cursor-pointer border-b border-transparent hover:border-white pb-0.5" />
                </div>
                <Link 
                  href="/admin/login" 
                  className="text-slate-100 hover:text-white transition-all duration-200 focus-visible:ring-offset-slate-900 border-b border-transparent hover:border-white pb-0.5"
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
