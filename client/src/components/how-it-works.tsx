import { Search, MapPin, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { language } = useI18n();
  
  const steps = [
    {
      icon: Search,
      title: language === 'ua' ? "Знайдіть товари" : "Find Products",
      description: language === 'ua' ? "Відкривайте українські товари в магазинах по всій Канаді." : "Discover Ukrainian-made products in stores across Canada."
    },
    {
      icon: MapPin,
      title: language === 'ua' ? "Додайте на карту" : "Add to Products to the Map",
      description: language === 'ua' ? "Діліться локаціями, додаючи мітки з деталями товарів." : "Share locations by adding pins with product details."
    },
    {
      icon: Users,
      title: language === 'ua' ? "Розкажіть іншим" : "Spread the Word",
      description: language === 'ua' ? "Допоможіть іншим знайти та підтримати український бізнес." : "Help others find and support Ukrainian businesses."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12 md:mb-16 space-y-3">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{language === 'ua' ? 'Як це працює' : 'How It Works'}</h2>
          <p className="text-muted-foreground text-[15px]">{language === 'ua' ? 'Три прості кроки для побудови нашої карти спільноти' : 'Three simple steps to help build our community map'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-full border-2 border-yellow-accent flex items-center justify-center mb-6 group-hover:bg-yellow-50 transition-colors duration-300">
                <step.icon className="w-7 h-7 text-black stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[280px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
