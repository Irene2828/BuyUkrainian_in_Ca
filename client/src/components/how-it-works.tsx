import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: "Looking for authentic Ukrainian goods?",
      image: "/assets/how-it-works-1.png",
      text: (<><strong>Explore</strong> our <strong>verified directory</strong> to find exactly what you need with instant directions.</>)
    },
    {
      title: "Found a new product on the shelf?",
      image: "/icon2.png",
      text: (<><strong>Add it to the map.</strong> Your contribution helps the community find new ways to support Ukraine.</>)
    },
    {
      title: "Want to help the Ukrainian economy?",
      image: "/assets/how-it-works-3.png",
      text: (<><strong>Share the map</strong> with your network. Visibility drives support and strengthens every purchase.</>)
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
    <section id="how-it-works" className="py-24 font-sans overflow-hidden bg-[#F8FAFC]">
      <div className="boutique-width px-6 md:px-12">
        {/* Section Header */}
        <div className="mb-20 max-w-4xl mx-auto flex flex-col gap-6 text-center items-center">
          <h2 className="text-[31px] md:text-[41px] font-bold tracking-tight leading-tight font-sans text-slate-900">
            {t('howItWorks.title') || 'When to Use this Map'}
          </h2>
        </div>

        {/* Steps Grid - Animated Stagger */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 w-full items-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={gridVariants}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={columnVariants}
              className="flex flex-col items-center text-center"
            >
              {/* Illustration Card Reservoir */}
              <div className="relative w-full aspect-[4/3] bg-white ring-1 ring-inset ring-slate-200/40 rounded-[32px] p-8 flex items-center justify-center transition-all duration-500 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden group">
                <img
                  src={step.image}
                  alt={step.title}
                  className={`max-h-[85%] w-auto object-contain transition-transform duration-700 group-hover:scale-105 ${index === 1 ? 'scale-[1.1]' : 'scale-[1.2]'}`}
                />
              </div>

              {/* Text Content - Outside the Card */}
              <div className="flex flex-col items-center w-full mt-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight leading-snug">
                  {step.title}
                </h3>
                <p className="text-[16px] leading-[1.6] text-slate-900/80 max-w-[280px] mx-auto">
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
