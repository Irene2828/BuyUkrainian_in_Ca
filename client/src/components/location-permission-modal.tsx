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
  const { locale } = useI18n();
  const isFr = locale === 'fr';

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
        className="max-w-[420px] w-[calc(100vw-32px)] bg-white rounded-none border border-slate-200 shadow-xl overflow-hidden flex flex-col p-0 gap-0"
        aria-describedby="location-permission-content"
      >
        <DialogHeader className="px-6 py-5 border-b border-slate-100 flex-shrink-0 bg-white items-center gap-3">
          <div className="w-12 h-12 bg-[#0057B7]/10 flex items-center justify-center rounded-none mb-2 mt-4">
            <MapPin className="w-6 h-6 text-[#0057B7]" />
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

        <div className="p-4 border-t border-slate-100 bg-white flex justify-center gap-3 flex-shrink-0">
          <button
            onClick={handleCancel}
            className="relative inline-flex w-auto items-center justify-center h-[46px] px-6 text-[16px] font-semibold tracking-normal rounded-none bg-transparent text-[#0057B7] border border-[#0057B7] shadow-none transition-all duration-300 hover:bg-[#0057B7] hover:border-[#0057B7] hover:text-white hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0057B7]/30 font-sans"
          >
            {isFr ? 'Pas maintenant' : 'Not now'}
          </button>
          <button
            onClick={handleContinue}
            className="relative inline-flex w-auto items-center justify-center h-[46px] px-6 text-[16px] font-semibold tracking-normal rounded-none bg-[#0057B7] text-white border border-[#0057B7] shadow-none transition-all duration-300 hover:bg-[#004494] hover:border-[#004494] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0057B7]/30 font-sans"
          >
            {isFr ? 'Continuer' : 'Continue'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
