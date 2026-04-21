import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0); // First item open by default - Project Mission visible
  const { t } = useI18n();

  const faqs = [
    {
      question: t("faq.items.item1.question"),
      answer: t("faq.items.item1.answer"),
    },
    {
      question: t("faq.items.item2.question"),
      answer: t("faq.items.item2.answer"),
    },
    {
      question: t("faq.items.item3.question"),
      answer: t("faq.items.item3.answer"),
    },
    {
      question: t("faq.items.item4.question"),
      answer: t("faq.items.item4.answer"),
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="relative font-sans overflow-hidden pt-[70px] pb-[52px] md:pt-[118px] md:pb-[88px] z-10 bg-white">
      <div className="boutique-width relative z-10 w-full">
        <div className="boutique-width w-full flex flex-col px-[22.8px] md:px-[38px] lg:px-[60.8px] min-[1280px]:max-[1669px]:px-[clamp(68.4px,4.75vw,87.4px)] min-[1670px]:px-[clamp(49.4px,3.42vw,68.4px)]">
          {/* Top: Centered Section Header */}
          <div className="w-full h-full flex flex-col items-center mb-7 md:mb-14 lg:mb-18">
            <h2 className="text-[31px] md:text-[41px] font-semibold font-['Lora'] tracking-tight leading-[1.1] section-headline-reveal text-slate-900 text-center">
              {t("faq.title")}
            </h2>
          </div>

          {/* Bottom: Accordion - Focused Width with constraint */}
          <div className="w-full max-w-lg flex flex-col mx-auto">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group border-t border-slate-100 first:border-t-0"
                open={openIndex === i}
                onClick={(e) => {
                  e.preventDefault();
                  toggleItem(i);
                }}
              >
                <summary className="flex justify-between items-center w-full py-8 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded-lg">
                  <span className={cn(
                    "text-[18px] font-semibold text-slate-800 leading-snug pr-6 transition-colors duration-200 group-hover:text-slate-600",
                  )}>
                    {faq.question}
                  </span>
                  <div
                    className={cn(
                      "flex items-center justify-center transition-all duration-300 ease-out shrink-0",
                      openIndex === i ? "rotate-180 text-slate-500" : "text-slate-300 group-hover:text-slate-500 group-hover:opacity-100"
                    )}
                  >
                    <ChevronDown className="w-5 h-5" strokeWidth={2} />
                  </div>
                </summary>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out font-ui",
                    openIndex === i ? "max-h-[500px] opacity-100 pb-8" : "max-h-0 opacity-0"
                  )}
                >
                  <div>
                    <p className="text-[16px] leading-relaxed max-w-[95%] text-slate-500">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div >
    </section >
  );
}
