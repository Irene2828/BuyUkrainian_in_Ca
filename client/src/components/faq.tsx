import { useState } from "react";
import { Plus } from "lucide-react";
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
        <div className="text-center mb-10">
          <h2 className="text-[36px] font-bold tracking-tight text-gray-900 mb-3 section-headline-reveal">
            {t('faq.title') || 'Frequently Asked Questions'}
          </h2>
          <p className="text-[16px] text-slate-500 max-w-[500px] mx-auto leading-relaxed font-ui px-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Accordion - "Soft Card" Approach */}
        <div className="flex flex-col w-full space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={cn(
                "transition-all duration-300 rounded-2xl px-6",
                openIndex === i ? "bg-slate-50/50" : ""
              )}
            >
              {/* Question - Clickable */}
              <button
                onClick={() => toggleItem(i)}
                className="no-invert-hover w-full flex items-center justify-between py-6 text-left group transition-colors duration-200"
                aria-expanded={openIndex === i}
              >
                <span className={cn(
                  "text-[18px] font-semibold tracking-tight pr-8 transition-all duration-200",
                  openIndex === i ? "text-gray-900" : "text-slate-600 group-hover:text-gray-900"
                )}>
                  {faq.question}
                </span>
                <div
                  className={cn(
                    "w-6 h-6 flex items-center justify-center text-slate-300 transition-transform duration-200 ease-out shrink-0",
                    openIndex === i && "rotate-45 text-gray-900"
                  )}
                >
                  <Plus className="w-5 h-5" />
                </div>
              </button>

              {/* Answer - Expandable */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200 ease-out",
                  openIndex === i ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="pb-8">
                  <p className="text-[15px] text-slate-500 leading-relaxed max-w-[600px] font-ui">
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
