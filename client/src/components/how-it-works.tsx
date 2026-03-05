import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      title: <>Looking for authentic products<br />Made in Ukraine?</>,
      altText: "Looking for authentic products Made in Ukraine?",
      image: "/assets/how-it-works-1.png",
      text: (<><strong>Explore</strong> our <strong>verified directory</strong> to find exactly what you need with instant directions.</>)
    },
    {
      title: <>Found a new Ukrainian product<br />in a local store?</>,
      altText: "Found a new Ukrainian product in a local store?",
      image: "/icon2.png",
      text: (<><strong>Add it to the map.</strong> With less than two minutes of your time, you can help the map grow, and help Ukrainian companies sell products in Canada.</>)
    },
    {
      title: <>Want to help the Ukrainian<br />economy grow?</>,
      altText: "Want to help the Ukrainian economy grow?",
      image: "/assets/how-it-works-3.png",
      text: (<><strong>Share the map</strong> with your network via social media, word of mouth, email, or any other way possible.</>)
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

  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.5 });

  return (
    <section id="how-it-works" className="py-24 font-sans overflow-hidden bg-white">
      <div className="utility-width px-6 md:px-12">
        {/* Section Header */}
        <div ref={headerRef} className="w-full mb-12 lg:mb-20 flex justify-center overflow-hidden">
          <h2
            className="text-[31px] md:text-[41px] font-semibold text-slate-900 tracking-tight leading-tight text-center translate-y-[40px] opacity-0 transition-all duration-1000 ease-out data-[in-view]:translate-y-0 data-[in-view]:opacity-100"
            data-in-view={isHeaderInView ? "" : undefined}
          >
            {t('howItWorks.title') || 'When to Use this Map'}
          </h2>
        </div>

        {/* Steps Grid - Animated Stagger */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10 w-full items-start"
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
              <div className="group flex flex-col h-full min-h-[480px] bg-white rounded-[32px] px-5 py-8 transition-all duration-300">

                {/* Top Section: Illustration (Centered & Fixed Height) */}
                <div className="h-[220px] w-full flex items-center justify-center mb-6 lg:mb-8">
                  <img
                    src={step.image}
                    alt={step.altText}
                    className="max-h-full w-auto object-contain transition-transform duration-700"
                  />
                </div>

                {/* Bottom Section: ContentStack */}
                <div className="flex flex-col items-center text-center w-full">
                  <h3 className="text-slate-900 font-semibold text-[18px] min-h-[4.5rem] lg:min-h-[5rem] flex items-start justify-center text-center tracking-tight leading-relaxed w-full">
                    <span>{step.title}</span>
                  </h3>
                  <p className="text-slate-500 text-[16px] leading-relaxed font-ui w-full text-center px-[10%]">
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
