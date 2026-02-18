import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: "Looking for authentic Ukrainian goods?",
      image: "/assets/how-it-works-1.png",
      text: "Explore our verified directory to find exactly what you need with instant directions"
    },
    {
      title: "Found a new product on the shelf?",
      image: "/icon2.png",
      text: "Add it to the map. Your contribution helps the community find new ways to support Ukraine"
    },
    {
      title: "Want to help the Ukrainian economy?",
      image: "/assets/how-it-works-3.png",
      text: "Share the map with your network. Visibility drives support and strengthens every purchase"
    }
  ];

  // Grid Stagger Container
  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.25,
      }
    }
  };

  const columnVariants = {
    hidden: {
      opacity: 0,
      y: 24
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  return (
    <section id="how-it-works" className="py-24 font-sans overflow-hidden bg-slate-50">
      <div className="boutique-width">
        {/* Section Header */}
        <div className="mb-16 max-w-4xl mx-auto flex flex-col gap-6 text-center items-center">
          <h2 className="text-[31px] md:text-[41px] font-semibold tracking-tight leading-tight font-sans text-slate-900">
            {t('howItWorks.title') || 'When to Use the Map'}
          </h2>
        </div>

        {/* Steps Grid - Animated Stagger */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={gridVariants}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={columnVariants}
              className="group relative flex flex-col h-full bg-white/80 backdrop-blur-xl ring-1 ring-inset ring-slate-200/50 rounded-[32px] p-8 transition-all duration-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            >
              {/* Flow Indicator */}
              <span className="absolute top-8 right-8 text-[48px] font-black text-slate-100 select-none transition-colors">
                0{index + 1}
              </span>

              {/* Illustration Container - Refined with Double Stroke Frame */}
              <div className="h-[240px] w-full flex items-center justify-center bg-gradient-to-b from-white/80 to-slate-50 rounded-2xl mb-8 overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className={`max-h-[85%] w-auto object-contain transition-transform duration-700 group-hover:scale-110 ${index === 1 ? 'scale-[1.1]' : 'scale-[1.2]'}`}
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col flex-1">
                <h3 className="text-xl font-bold text-[#0F172A] mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-slate-600/90 font-ui font-normal">
                  {step.text}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
