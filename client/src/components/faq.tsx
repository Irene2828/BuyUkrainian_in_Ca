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
    <section id="faq" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-[15px]">Everything you need to know about BlueYellow.ca</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/60">
              <AccordionTrigger className="text-left text-[15px] md:text-base font-medium py-4 hover:text-blue-accent hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm md:text-[15px] leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
