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
    <section id="faq" className="relative font-sans overflow-hidden py-12 md:py-16 z-10 bg-white">
      <div className="relative z-10 w-full">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 px-4 sm:px-6 lg:px-8 items-start relative pt-12 pb-12">
          {/* Left Column: Heading + Descriptive Paragraph */}
          <div className="lg:col-span-5 flex flex-col items-start text-left pt-0 self-start">
            <h2 className="text-[31px] md:text-[41px] font-medium font-['Lora'] tracking-tight leading-[1.1] section-headline-reveal text-[#0057B7] mb-10 antialiased -mt-1.5">
              About the project
            </h2>
            <p className="text-slate-600 text-[18px] leading-relaxed max-w-[95%] antialiased font-ui">
              {t("aboutPage.intro") || "BuyUkrainian.ca is a community-powered platform that helps Canadians discover products made in Ukraine and support the businesses bringing them to shelves across the country."}
            </p>
          </div>

          {/* Right Column: Accordion Items */}
          <div className="lg:col-span-7 w-full flex flex-col lg:pl-[10%]">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className={cn(
                  "group border-b border-slate-100 last:border-b-0 border-l-2 border-transparent pl-4 sm:pl-6 transition-all duration-300"
                )}
                open={openIndex === i}
                onClick={(e) => {
                  e.preventDefault();
                  toggleItem(i);
                }}
              >
                <summary className={cn(
                  "flex justify-between items-center w-full pb-8 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded-lg",
                  i === 0 ? "pt-1" : "pt-8"
                )}>
                  <span className={cn(
                    "text-[18px] font-medium text-slate-700 leading-snug pr-6 transition-colors duration-200 group-hover:text-slate-600",
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
