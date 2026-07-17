import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AboutProject({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <section id="about" className={cn("relative bg-slate-50 pt-20 pb-24 md:pt-24 md:pb-32 font-sans overflow-hidden", className)}>
      <div className="content-width flex flex-col justify-center items-center">
        {/* Simple Text Container */}
        <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-widest mb-6 font-['Inter']">
              ABOUT THE PROJECT
            </h2>
            <p className="text-slate-600 text-[16px] md:text-[18px] max-w-2xl font-normal leading-relaxed mb-4">
              {t("aboutPage.intro") || "BuyUkrainian.ca is a community-powered platform that helps Canadians discover products made in Ukraine and support the businesses bringing them to shelves across the country."}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
