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
        className="relative z-10 inline-flex w-auto items-center justify-center h-[48px] px-[25px] text-[16.8px] font-semibold tracking-normal rounded-none bg-transparent text-[#0057B7] border border-[#0057B7] shadow-none transition-all duration-300 hover:bg-[#0057B7] hover:border-[#0057B7] hover:text-white 2xl:h-[57px] 2xl:text-[17.85px] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0057B7]/30 gap-[10.5px] group/cta-btn mx-auto font-sans"
      >
        <span>{t("mapPage.addNewStore") || "Add a New Store"}</span>
        <Plus className="w-[16.8px] h-[16.8px] 2xl:w-[21px] 2xl:h-[21px] transition-all duration-300 group-hover/cta-btn:scale-110 text-current" />
      </button>
    </div>
  );
}
