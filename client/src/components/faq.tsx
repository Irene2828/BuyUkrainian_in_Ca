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
    <section id="faq" className="bg-white font-sans overflow-hidden pt-[80px] pb-[60px] px-[64px]">
      {/* Increased pt-[80px] for breathing space before FAQ headline */}
      <div className="mx-auto max-w-[800px] relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-[42px] font-medium mb-4 text-[var(--color-section-headline)] tracking-tight font-header section-headline-reveal">Project's mission</h2>
          <p className="text-[18px] font-normal text-gray-500 font-ui">More about the initiative</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-none shadow-none bg-transparent">
              {/* Removed border and background, added hover grey effect */}
              <AccordionTrigger className="text-left text-[20px] font-medium py-6 text-black hover:text-gray-400 hover:no-underline transition-colors [&>svg]:text-black font-ui">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[16px] font-normal text-gray-600 leading-relaxed pb-6 font-ui">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
