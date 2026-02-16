import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      image: "/assets/how-it-works-1.png",
      bullets: [
        <span key="1"><strong className="font-bold text-slate-900">Filter</strong> locations by province or specific business category.</span>,
        <span key="2"><strong className="font-bold text-slate-900">Access</strong> instant directions, website links, and core details.</span>
      ]
    },
    {
      image: "/icon2.png",
      bullets: [
        <span key="3"><strong className="font-bold text-slate-900">Spot</strong> a missing Ukrainian business? <strong className="font-bold text-slate-900">Drop a new pin</strong>.</span>,
        <span key="4"><strong className="font-bold text-slate-900">Help build</strong> a highly accurate, community-driven directory.</span>
      ]
    },
    {
      image: "/assets/how-it-works-3.png",
      bullets: [
        <span key="5"><strong className="font-bold text-slate-900">Share</strong> the map to help others discover local products.</span>,
        <span key="6"><strong className="font-bold text-slate-900">Turn</strong> community visibility into direct <strong className="font-bold text-slate-900">economic support</strong>.</span>
      ]
    }
  ];

  // Grid Stagger Container
  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.25, // 250ms delay between columns
      }
    }
  };

  // Column Item Animation (Fade In + Drift Up)
  const columnVariants = {
    hidden: {
      opacity: 0,
      y: 20 // Drift up start
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8, // 800ms
        ease: [0.16, 1, 0.3, 1] as const // Premium weighted motion
      }
    }
  };

  return (
    <section id="how-it-works" className="pt-[120px] pb-[132px] font-sans overflow-hidden bg-white">
      <div className="boutique-width">
        {/* Section Header */}
        <div className="mb-4 max-w-4xl mx-auto flex flex-col gap-6 text-center items-center">
          <h2 className="text-[41px] font-semibold tracking-tight leading-[1.2] font-sans section-headline-reveal text-slate-900 opacity-75">
            {t('howItWorks.title') || 'How to Use this Map'}
          </h2>
        </div>

        {/* Steps Grid - Animated Stagger */}
        <motion.div
          className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 w-full max-w-none mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }} // Trigger when 20% visible
          variants={gridVariants}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={columnVariants}
              className="flex flex-col items-center text-center px-4 w-full"
            >

              {/* Illustration - Tighter Spacing (16px reduction from 32px/previous to 16px/mb-4) */}
              <div className="h-[340px] w-full flex items-center justify-center overflow-hidden mb-4">
                <img
                  src={step.image}
                  alt={`Step ${index + 1}`}
                  className={`max-h-full w-auto object-contain transform ${index === 1 ? 'max-[1440px]:scale-[1.2] scale-[1.35]' : 'max-[1440px]:scale-[1.3] scale-[1.45]'}`}
                />
              </div>

              {/* Minimalist Bullet List */}
              <ul className="w-full max-w-[260px] mx-auto text-left list-none space-y-4 px-4 md:px-0">
                {step.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="font-ui text-[16px] leading-[1.6] text-slate-900/80 pl-0"
                  >
                    <span className="mr-2">-</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
