import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { AccessibilityToggle } from "@/components/ui/accessibility-toggle";

export function Footer() {
  const { t } = useI18n();
  const [location] = useLocation();

  return (
    <footer className="bg-slate-900 text-slate-400 font-sans overflow-hidden py-16 md:py-24 antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Anchor: Brand & Mission */}
          <div className="md:col-span-6 flex flex-col items-start justify-start">
            <p className="text-[14.5px] leading-relaxed max-w-md mb-12 opacity-80 text-slate-300">
                Volunteer initiative to support Ukraine from Canada
            </p>
            <span className="text-[13px] font-normal tracking-tight opacity-40 mt-auto">
              © 2026 BuyUkrainian.ca
            </span>
          </div>

          {/* Right Anchor: Navigation Columns */}
          <div className="md:col-span-6 flex flex-col sm:flex-row gap-12 md:justify-end">
            
            {/* CONTACT Cluster */}
            <div className="md:col-span-3 flex flex-col items-start justify-start gap-4">
              <h3 className="text-white text-[14px] font-medium">
                Contact
              </h3>
              <nav className="flex flex-col gap-4 text-[14px] font-medium">
                <a href="mailto:hello@buyukrainian.ca" className="hover:text-white transition-colors duration-300">
                  Email Us
                </a>
              </nav>
            </div>

            {/* LEGAL Cluster */}
            <div className="md:col-span-3 flex flex-col items-start justify-start gap-4">
              <h3 className="text-white text-[14px] font-medium">
                Legal
              </h3>
              <nav className="flex flex-col gap-4 text-[14px] font-medium">
                <Link href="/privacy" className="hover:text-white transition-colors duration-300">
                  {t('common.labels.privacyPolicy') || 'Privacy Policy'}
                </Link>
                <div className="flex items-center -ml-0.5">
                    <AccessibilityToggle className="hover:text-white text-slate-400 p-0 h-auto bg-transparent border-none text-[14px] font-normal transition-colors duration-300 cursor-pointer shadow-none ring-0 focus-visible:ring-0" />
                </div>
                <Link href="/admin/login" className="hover:text-white transition-colors duration-300">
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
