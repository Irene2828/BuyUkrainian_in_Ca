import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { MapPin } from "lucide-react";

interface LocationPermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  onCancel: () => void;
}

export function LocationPermissionModal({ open, onOpenChange, onContinue, onCancel }: LocationPermissionModalProps) {
  const { language } = useI18n();
  const isFr = language === 'fr-CA';

  const handleContinue = () => {
    onContinue();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[420px] w-[calc(100vw-32px)] bg-white rounded-[24px] border border-slate-200 shadow-xl overflow-hidden flex flex-col p-0 gap-0"
        aria-describedby="location-permission-content"
      >
        <DialogHeader className="px-6 py-5 border-b border-slate-100 flex-shrink-0 bg-white items-center gap-3">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 flex items-center justify-center rounded-full mb-2 mt-4 shadow-sm">
            <MapPin className="w-7 h-7 text-[#0057B7]" />
          </div>
          <DialogTitle className="text-xl font-bold font-header text-slate-900 text-center">
            {isFr ? 'Autorisation de localisation' : 'Location permission'}
          </DialogTitle>
        </DialogHeader>
        
        <div 
          id="location-permission-content"
          className="p-6 overflow-y-auto bg-slate-50/30"
        >
          <p className="text-[15px] leading-relaxed text-slate-700 font-sans text-center">
            {isFr 
              ? "Utilisez votre position pour centrer la carte et trouver des boutiques à proximité. BuyUkrainian.ca ne conserve pas la position de votre appareil."
              : "Use your location to centre the map and find nearby stores. BuyUkrainian.ca does not store your device location."
            }
          </p>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white flex justify-center gap-4 flex-shrink-0">
          <button
            onClick={handleCancel}
            className="relative inline-flex w-auto items-center justify-center h-[46px] px-6 text-[15px] font-semibold tracking-normal rounded-full bg-slate-50/80 text-slate-600 border border-slate-300 shadow-sm transition-all duration-300 hover:bg-slate-100 hover:text-slate-900 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-slate-400/30 font-sans"
          >
            {isFr ? 'Pas maintenant' : 'Not now'}
          </button>
          <button
            onClick={handleContinue}
            className="relative inline-flex w-auto items-center justify-center h-[46px] px-8 text-[15px] font-semibold tracking-normal rounded-full bg-[#FFD700] text-[#003B7A] border border-transparent shadow-[0_2px_8px_rgba(255,215,0,0.4)] transition-all duration-300 hover:bg-[#FFE033] hover:scale-[1.05] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#FFD700]/50 font-sans"
          >
            {isFr ? 'Continuer' : 'Continue'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
