import React from "react";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function AddStoreCTA() {
  const { t } = useI18n();
  const handleOpenModal = () => {
    window.dispatchEvent(new CustomEvent("openAddStoreModal"));
  };

  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center pt-[24px] md:pt-[40px] pb-[36px] md:pb-[60px] text-center px-4 bg-white/85 backdrop-blur-xl">
      <p className="text-reveal relative z-10 text-[18px] font-medium text-slate-900 leading-relaxed text-center max-w-[40ch] mx-auto mb-6">
        {t("mapPage.knowStore") || "Know a store we missed? Add it to the map."}
      </p>
      <button
        onClick={handleOpenModal}
        className="group/cta-btn relative inline-flex items-center justify-center gap-2 px-[18px] py-[8px] rounded-full border border-slate-300 bg-slate-50/80 hover:bg-[#0057B7] text-slate-700 hover:text-white text-[14.8px] font-medium transition-all duration-300 shadow-sm cursor-pointer outline-none whitespace-nowrap z-10 mx-auto"
      >
        <Plus className="h-[18px] w-[18px] text-current stroke-[2.5] transition-transform duration-300 group-hover/cta-btn:rotate-90" />
        <span>{t("mapPage.addNewStore") || "Add a new store"}</span>
      </button>
    </div>
  );
}
