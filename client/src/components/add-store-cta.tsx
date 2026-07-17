import React from "react";
import { Plus } from "lucide-react";

export function AddStoreCTA() {
  const handleOpenModal = () => {
    window.dispatchEvent(new CustomEvent("openAddStoreModal"));
  };

  return (
    <div className="flex flex-col items-center justify-center pt-[24px] md:pt-[40px] pb-[36px] md:pb-[60px] text-center px-4 bg-white border-t border-b border-slate-200/60">
      <p className="text-[18px] font-medium text-slate-800 leading-relaxed text-center max-w-[40ch] mx-auto mb-6">
        Know a store we missed? Add it to the map.
      </p>
      <button
        onClick={handleOpenModal}
        className="inline-flex items-center justify-center h-[46px] px-6 text-[16px] font-medium tracking-tight rounded-none bg-white text-[#0057B7] transition-all duration-300 hover:bg-[#0057B7] hover:text-white 2xl:h-[54px] 2xl:text-[17px] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0057B7]/40 gap-2.5 group/cta-btn mx-auto font-sans"
        style={{ border: '1px solid #0057B7' }}
      >
        <span>Add a New Store</span>
        <Plus className="w-4 h-4 2xl:w-5 2xl:h-5 transition-all duration-300 group-hover/cta-btn:scale-110 group-hover/cta-btn:text-white text-[#0057B7]" />
      </button>
    </div>
  );
}
