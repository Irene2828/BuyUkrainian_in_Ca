import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function AboutProject({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <section id="about" className={cn("relative bg-white pt-10 pb-2 md:pt-12 md:pb-3 font-sans overflow-hidden", className)}>
      <div className="content-width flex flex-col justify-center items-center">
        {/* Simple Text Container */}
        <div className="about-arrive text-reveal relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center">
          <div
            className="flex flex-col items-center"
          >
            {/* Brand Yellow Divider */}
            <div className="w-20 md:w-28 h-[3px] bg-[#FFD700] rounded-full mb-[38px] md:mb-[54px]" aria-hidden="true" />
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-widest mb-6 font-sans">
              {t("faq.title") || "ABOUT THE PROJECT"}
            </h2>
            <p className="text-slate-600 text-[16px] md:text-[18px] max-w-4xl font-normal leading-relaxed mb-4 md:mb-5 text-center">
              BuyUkrainian.ca is an <strong className="font-bold text-slate-800">independent, grassroots initiative</strong> aimed to support Ukraine’s economy by helping people find products from Ukraine in Canadian stores.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
