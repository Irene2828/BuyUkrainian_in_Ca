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
    <section id="how-it-works" className="py-24 font-sans overflow-hidden bg-white">
      <div className="boutique-width px-6 md:px-12">
        {/* Section Header */}
        <div className="mb-16 max-w-4xl mx-auto flex flex-col gap-6 text-center items-center">
          <h2 className="text-[31px] md:text-[41px] font-semibold tracking-tight leading-tight text-slate-900">
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
              className="h-full"
            >
              {/* Feature Card: Unified Container */}
              <div className="group flex flex-col h-full min-h-[480px] bg-white rounded-[32px] p-8 transition-all duration-300">

                {/* Top Section: Illustration (Centered & Fixed Height) */}
                <div className="w-full h-[220px] min-h-[220px] shrink-0 flex items-center justify-center relative">
                  <img
                    src={step.image}
                    alt={step.title}
                    className={`max-h-[180px] w-auto object-contain transition-transform duration-700 group-hover:scale-110 ${index === 1 ? 'scale-[1.1]' : 'scale-[1.2]'}`}
                  />
                </div>

                {/* Bottom Section: ContentStack */}
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-slate-900 font-semibold text-lg mt-20 mb-6 min-h-[56px] flex items-center justify-center">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-[16px] leading-relaxed font-ui max-w-[260px] mx-auto">
                    {step.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
