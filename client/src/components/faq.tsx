import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(-1); // All closed by default
  const { t } = useI18n();

  const faqs = [
    {
      question: t('faq.q1'),
      answer: t('faq.a1')
    },
    {
      question: t('faq.q2'),
      answer: t('faq.a2')
    },
    {
      question: t('faq.q3'),
      answer: t('faq.a3')
    },
    {
      question: t('faq.q4'),
      answer: t('faq.a4')
    },
    {
      question: t('faq.q5'),
      answer: t('faq.a5')
    }
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="bg-white font-sans overflow-hidden pt-12 pb-[100px] px-4 md:px-16">
      <div className="mx-auto max-w-2xl relative z-10 w-full">
        <div className="text-center mb-[48px]">
          <h2 className="text-[28px] md:text-[32px] font-bold text-black mb-4 tracking-tight font-header section-headline-reveal">
            {t('faq.title')}
          </h2>
        </div>

        {/* Accordion - Clean design without borders and grey fills */}
        <div className="flex flex-col w-full">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-[rgba(0,0,0,0.05)] last:border-0">
              {/* Question - Clickable */}
              <button
                onClick={() => toggleItem(i)}
                className="no-invert-hover w-full flex items-center justify-between py-8 text-left group transition-colors duration-300"
                aria-expanded={openIndex === i}
              >
                <span className={cn(
                  "text-[16px] md:text-[18px] font-medium font-ui transition-colors duration-300 pr-8",
                  openIndex === i ? "text-[#111827]" : "text-[#6B7280] group-hover:text-[#111827]"
                )}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>

              {/* Answer - Expandable */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-out",
                  openIndex === i ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="pb-6">
                  <p className="text-[14px] md:text-[16px] font-normal text-slate-600 leading-relaxed font-ui">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
