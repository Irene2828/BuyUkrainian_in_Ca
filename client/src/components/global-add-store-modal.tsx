import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
import { GoogleMapsProvider } from "@/components/google-maps-provider";

export function GlobalAddStoreModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("openAddStoreModal", handleOpen);
    window.addEventListener("openAddStore", handleOpen); // for legacy
    
    return () => {
      window.removeEventListener("openAddStoreModal", handleOpen);
      window.removeEventListener("openAddStore", handleOpen);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[600px] w-[calc(100vw-32px)] md:w-full mx-auto p-0 border-none bg-transparent shadow-none overflow-visible">
        <GoogleMapsProvider>
          <HomeAddForm onClose={() => setIsOpen(false)} />
        </GoogleMapsProvider>
      </DialogContent>
    </Dialog>
  );
}
