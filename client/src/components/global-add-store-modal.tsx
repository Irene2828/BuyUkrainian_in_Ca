import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HomeAddForm } from "@/components/home-add-form";
import { GoogleMapsProvider } from "@/components/google-maps-provider";
import { Store } from "@/lib/data";

export function GlobalAddStoreModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState<Store | null>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.store) {
        setInitialData(customEvent.detail.store);
      } else {
        setInitialData(null);
      }
      setIsOpen(true);
    };
    window.addEventListener("openAddStoreModal", handleOpen);
    window.addEventListener("openAddStore", handleOpen); // for legacy
    
    return () => {
      window.removeEventListener("openAddStoreModal", handleOpen);
      window.removeEventListener("openAddStore", handleOpen);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[600px] w-[calc(100vw-32px)] md:w-full mx-auto p-0 border-none bg-transparent shadow-none overflow-visible z-[9999]">
        <GoogleMapsProvider>
          <HomeAddForm onClose={() => setIsOpen(false)} initialData={initialData} />
        </GoogleMapsProvider>
      </DialogContent>
    </Dialog>
  );
}
