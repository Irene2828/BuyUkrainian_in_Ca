import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I add a product to the map?",
    answer: "Simply click the 'Add Product' button, verify your location, and upload a photo of the product details."
  },
  {
    question: "Is this service free to use?",
    answer: "Yes, BlueYellow.ca is completely free for both shoppers and businesses."
  },
  {
    question: "How do you verify products are Ukrainian-made?",
    answer: "We rely on community verification and check product barcodes (482 prefix) when possible."
  },
  {
    question: "Can I suggest stores that should be added?",
    answer: "Absolutely! You can add store locations without specific products to help others find them."
  },
  {
    question: "Do you have a mobile app?",
    answer: "We are currently a mobile-first website, optimized for any device. An app is coming soon!"
  }
];

export function FAQ() {
  return (
    <section id="faq" className="bg-white font-sans overflow-hidden py-12 md:py-24 px-4 md:px-16">
      <div className="mx-auto max-w-[1200px] relative z-10">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-[28px] md:text-[42px] font-medium mb-4 text-[var(--color-section-headline)] tracking-tight font-header section-headline-reveal">Project's mission</h2>
          <p className="text-[16px] md:text-[18px] font-normal text-gray-500 font-ui">More about the initiative</p>
        </div>

        {/* Desktop: Grid layout with 3 columns, gap-12 - LEFT aligned text */}
        <div className="hidden md:grid md:grid-cols-3 gap-12">
          {faqs.slice(0, 3).map((faq, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors text-left">
              <h3 className="text-[18px] font-semibold mb-3 text-black font-ui">{faq.question}</h3>
              <p className="text-[15px] font-normal text-gray-600 leading-relaxed font-ui">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Desktop: Second row for remaining items - LEFT aligned text */}
        <div className="hidden md:grid md:grid-cols-2 gap-12 mt-12 max-w-[800px] mx-auto">
          {faqs.slice(3).map((faq, i) => (
            <div key={i + 3} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors text-left">
              <h3 className="text-[18px] font-semibold mb-3 text-black font-ui">{faq.question}</h3>
              <p className="text-[15px] font-normal text-gray-600 leading-relaxed font-ui">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Mobile: Accordion with CENTER aligned headers, gap-6 */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none shadow-none bg-gray-50 rounded-xl overflow-hidden">
                <AccordionTrigger className="text-center text-[16px] font-medium px-4 py-4 text-black hover:text-gray-600 hover:no-underline transition-colors [&>svg]:text-black font-ui justify-center [&>svg]:ml-2">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] font-normal text-gray-600 leading-relaxed px-4 pb-4 font-ui text-center">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
