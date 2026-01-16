import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(-1); // All closed by default
  const { t } = useI18n();

  const faqs = [
    {
      question: t('faq.q1') || 'What is BuyUkrainian.ca?',
      answer: t('faq.a1') || 'BuyUkrainian.ca is a community-driven platform that helps people discover Ukrainian-made products sold across Canada.'
    },
    {
      question: t('faq.q2') || 'How can I add a store?',
      answer: t('faq.a2') || 'Click the "Add a Location" button, fill in the store details including name, products, and address.'
    },
    {
      question: t('faq.q3') || 'Why do submissions need review?',
      answer: t('faq.a3') || 'To maintain quality and prevent spam, all submissions are reviewed by fellow Ukrainian community members.'
    },
    {
      question: t('faq.q4') || 'Can I suggest edits to existing listings?',
      answer: t('faq.a4') || 'Currently, you can contact us to suggest corrections. We\'re working on a feature to allow community edits in the future.'
    },
    {
      question: t('faq.q5') || 'Is this service free?',
      answer: t('faq.a5') || 'Yes! BuyUkrainian.ca is completely free to use.'
    }
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="bg-white font-sans overflow-hidden pt-12 pb-[100px] px-4 md:px-16">
      <div className="mx-auto max-w-2xl relative z-10 w-full">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-[28px] md:text-[42px] font-medium tracking-tight text-slate-900 leading-tight section-headline-reveal">
            {t('faq.title') || 'FAQ'}
          </h2>
          <p className="mt-6 text-[16px] md:text-[20px] text-slate-900/60 lowercase italic tracking-wide max-w-[500px] mx-auto leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Accordion - Clean Column Layout */}
        <div className="max-w-[640px] mx-auto w-full px-6">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border-b border-slate-100 last:border-0"
            >
              {/* Question - Clickable */}
              <button
                onClick={() => toggleItem(i)}
                className="flex justify-between items-center w-full py-5 text-left group cursor-pointer no-invert-hover transition-colors"
                aria-expanded={openIndex === i}
              >
                <span className={cn(
                  "text-[16px] font-medium text-slate-700 leading-snug pr-4 transition-colors duration-200",
                  openIndex === i ? "text-slate-900" : "group-hover:text-slate-900"
                )}>
                  {faq.question}
                </span>
                <div
                  className={cn(
                    "flex items-center justify-center text-slate-300 transition-all duration-200 ease-out shrink-0",
                    openIndex === i ? "rotate-180 text-slate-900" : "group-hover:text-slate-500"
                  )}
                >
                  <ChevronDown className="w-5 h-5 stroke-[1.5]" />
                </div>
              </button>

              {/* Answer - Expandable */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-out",
                  openIndex === i ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="pb-6">
                  <p className="text-[16px] text-slate-500 leading-relaxed max-w-[600px] font-light font-ui">
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
