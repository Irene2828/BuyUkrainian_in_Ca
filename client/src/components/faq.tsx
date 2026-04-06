import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0); // First item open by default - Project Mission visible
  const { t } = useI18n();

  const faqs = [
    {
      question: t('faq.q1') || 'What is BuyUkrainian.ca?',
      answer: t('faq.a1') || 'BuyUkrainian.ca is a community-driven map that helps people find Ukrainian-made products sold across Canada.'
    },
    {
      question: t('faq.q2') || 'How can I add a store?',
      answer: t('faq.a2') || 'Select the "Add a store" button, fill in the details including name, products, and address.'
    },
    {
      question: t('faq.q3') || 'Why do additions need review?',
      answer: t('faq.a3') || 'Additions are reviewed by the community to keep the map accurate and useful.'
    },
    {
      question: t('faq.q4') || 'Can I update store details?',
      answer: t('faq.a4') || 'Currently, you can contact us to update information. We\'re working on a feature to allow community edits in the future.'
    }
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="relative font-sans overflow-hidden py-[48px] md:py-[80px] z-10 border-b border-slate-200/50 bg-white">
      <div className="boutique-width relative z-10 w-full">
        <div className="mb-8 lg:mb-12 max-w-3xl mx-auto flex flex-col gap-6 text-center items-center">
          <h2 className="text-[31px] md:text-[41px] font-semibold tracking-tight leading-tight section-headline-reveal text-slate-900">
            The Project's Mission
          </h2>

        </div>

        {/* Accordion - Semantic Details/Summary */}
        <div className="max-w-[680px] mx-auto w-full px-4 md:px-0 flex flex-col">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group border-t border-slate-200 first:border-t-0"
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
                    "flex items-center justify-center text-slate-300 transition-all duration-300 ease-out shrink-0",
                    openIndex === i ? "rotate-180 text-slate-900" : "group-hover:text-slate-600"
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
      </div >
    </section >
  );
}
