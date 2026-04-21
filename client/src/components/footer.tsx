import { Link } from "wouter";
import { AccessibilityToggle } from "@/components/ui/accessibility-toggle";
import { useI18n } from "@/lib/i18n";
import { FOOTER_NAV_LINK_CLASSNAME } from "@/components/nav-link-styles";

export function Footer() {
  const { t } = useI18n();
  const footerRailClassName =
    "w-full px-[22.8px] md:px-[38px] lg:px-[60.8px] min-[1280px]:max-[1669px]:px-[clamp(68.4px,4.75vw,87.4px)] min-[1670px]:px-[clamp(49.4px,3.42vw,68.4px)]";
  return (
    <footer className="bg-[#0F1623] text-[var(--white)] font-sans overflow-hidden relative pt-[calc(clamp(4.5rem,8vh,8rem)-48px)] md:pt-[calc(clamp(4.5rem,8vh,8rem)-64px)] pb-[clamp(2rem,3.75vh,3.75rem)]">
      <div className="boutique-width w-full min-h-[216px] md:min-h-[261px] flex flex-col items-stretch justify-between pt-[43px] md:pt-[54px]">

        <div className="w-full">
          <div className={footerRailClassName}>
            <div className="w-full flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8 md:gap-12">
                <AccessibilityToggle className={FOOTER_NAV_LINK_CLASSNAME} />
                <a
                  href="mailto:hello@buyukrainian.ca"
                  className={`${FOOTER_NAV_LINK_CLASSNAME} no-underline`}
                >
                  {t("common.labels.contact")}
                </a>

                <Link
                  href="/privacy"
                  className={`${FOOTER_NAV_LINK_CLASSNAME} no-underline`}
                >
                  {t("common.labels.privacyPolicy")}
                </Link>
              </div>

              <div className="flex flex-col items-start gap-4 md:items-end">
                <Link
                  href="/admin/login"
                  className="text-[13px] text-slate-400 no-underline transition-colors duration-300 hover:text-slate-200"
                >
                  {t("common.labels.adminAccess")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-auto pt-[135px] flex justify-center text-center">
          <div className="min-h-[48px] flex flex-col items-center justify-center text-center gap-1">

            <p
              className="text-[12px] font-normal text-slate-500/80 tracking-[0.02em] leading-tight"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Copyright © 2026 BuyUkrainian.ca
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
