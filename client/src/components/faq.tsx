import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const { t } = useI18n();

  const faqs = [
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
    <section id="faq" className="bg-slate-50 py-24 font-sans overflow-hidden">
      <div className="content-width flex flex-col justify-center items-center gap-16">

        {/* Accordion Container */}
        <div className="w-full max-w-4xl mx-auto flex flex-col lg:pl-[10%] relative z-10">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                className="border-b border-slate-100 last:border-b-0 w-full"
              >
                <details
                  className={cn(
                    "group border-l-2 border-transparent pl-4 sm:pl-6 transition-all duration-300"
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
                      "text-[18px] font-bold text-[#0057B7] leading-snug pr-6 transition-colors duration-200 group-hover:text-[#004494]",
                    )}>
                      {faq.question}
                    </span>
                    <div
                      className={cn(
                        "flex items-center justify-center transition-all duration-300 ease-out shrink-0",
                        openIndex === i ? "rotate-180 text-slate-500" : "text-slate-300 group-hover:text-[#0057B7] group-hover:opacity-100"
                      )}
                    >
                      <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                  </summary>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-500 ease-in-out font-ui",
                      openIndex === i ? "max-h-[500px] opacity-100 pb-8" : "max-h-0 opacity-0"
                    )}
                  >
                    <div>
                      <p className="text-[16px] leading-relaxed max-w-[95%] text-slate-600 font-medium">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </details>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
