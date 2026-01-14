import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do you verify that products are actually Ukrainian?",
    answer: "Quality is our priority. Every submission is reviewed by our team. We look for indicators of origin—such as 'Made in Ukraine' labels, barcodes starting with 482, or official brand heritage—before approving a pin."
  },
  {
    question: "Do I buy products directly through this website?",
    answer: "No, we are a discovery engine. We guide you to local Canadian retailers or verified online shops so you can support them directly. We do not process payments or take commissions."
  },
  {
    question: "How can I add a store I found?",
    answer: "Click 'Add to Map,' drop a pin, and upload a photo. Our community relies on scouts like you to keep the directory growing."
  },
  {
    question: "Is this service free?",
    answer: "100%. This is a volunteer initiative dedicated to supporting the Ukrainian economy."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0); // First item expanded by default

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="bg-white font-sans overflow-hidden pt-12 pb-[100px] px-4 md:px-16">
      <div className="mx-auto max-w-2xl relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-[28px] md:text-[32px] font-medium text-[var(--color-section-headline)] mb-4 tracking-tight font-header section-headline-reveal">
            Common Questions
          </h2>
          <p className="text-[16px] md:text-[18px] font-normal text-gray-500 font-ui leading-relaxed">
            Everything you need to know about finding products, adding stores, and supporting the mission.
          </p>
        </div>

        {/* Accordion - Clean design without borders and grey fills */}
        <div className="flex flex-col">
          {faqs.map((faq, i) => (
            <div key={i}>
              {/* Question - Clickable */}
              <button
                onClick={() => toggleItem(i)}
                className="no-invert-hover w-full flex items-center justify-between py-5 text-left group transition-colors"
              >
                <span className={cn(
                  "text-[16px] md:text-[18px] font-semibold font-ui transition-colors",
                  openIndex === i ? "text-black" : "text-gray-600 group-hover:text-black"
                )}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-400 transition-transform duration-300 shrink-0 ml-4",
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
                <div className="pb-5">
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
