import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function AboutProject({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <section id="about" className={cn("relative bg-white pt-10 pb-2 md:pt-12 md:pb-3 font-sans overflow-hidden", className)}>
      {/* Full Browser Edge-to-Edge Subtle Silver Grey Hairline Divider */}
      <div className="w-full h-[1px] bg-slate-200/60 mb-16 md:mb-20" aria-hidden="true" />
      <div className="content-width flex flex-col justify-center items-center">
        {/* Simple Text Container */}
        <div className="about-arrive text-reveal relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center">
          <div
            className="flex flex-col items-center"
          >
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-widest mb-6 font-sans">
              {t("faq.title") || "ABOUT THE PROJECT"}
            </h2>
            <p className="about-project-desc font-ui text-slate-600 text-[16px] font-medium leading-relaxed max-w-3xl mb-6 md:mb-8 text-center [text-wrap:balance]">
              {t("aboutPage.intro") || (
                <>
                  BuyUkrainian.ca is an independent, grassroots initiative aimed to<br className="hidden sm:inline" />{" "}
                  support Ukraine’s economy by making it easier to find products<br className="hidden sm:inline" />{" "}
                  from Ukraine in Canadian stores.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
