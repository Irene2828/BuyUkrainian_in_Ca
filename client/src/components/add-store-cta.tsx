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
        className="group inline-flex items-center justify-center gap-2 h-[48px] px-6 rounded-full border border-[#0057B7]/40 bg-[#0057B7]/10 hover:bg-[#0057B7]/20 text-[#0057B7] text-[15px] font-medium tracking-wide transition-all duration-300 hover:border-[#0057B7]/70 active:scale-[0.97] cursor-pointer outline-none backdrop-blur-md whitespace-nowrap z-10 mx-auto font-sans"
      >
        <Plus className="h-4 w-4 text-[#0057B7] transition-transform duration-300 group-hover:rotate-90" strokeWidth={2.5} />
        <span>{t("mapPage.addNewStore") || "Add a new store"}</span>
      </button>
    </div>
  );
}
