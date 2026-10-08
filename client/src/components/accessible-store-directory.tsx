import { useQuery } from "@tanstack/react-query";
import { getApprovedStores } from "@/lib/api";
import { Store } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function AccessibleStoreDirectory({ onClose }: { onClose?: () => void }) {
  const { t, language } = useI18n();
  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: getApprovedStores,
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const grouped = stores.reduce((acc, store) => {
    const prov = store.province || "Other";
    if (!acc[prov]) acc[prov] = [];
    acc[prov].push(store);
    return acc;
  }, {} as Record<string, Store[]>);

  const sortedProvinces = Object.keys(grouped).sort();
  const isFr = language === 'fr-CA';

  return (
    <div 
      ref={containerRef}
      tabIndex={-1}
      className="w-full bg-white px-6 py-12 md:px-12 md:py-16 focus:outline-none min-h-[600px]" 
      aria-label={isFr ? "Répertoire des boutiques (Vue texte)" : "Stores Directory (Text View)"}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 id="text-directory-heading" className="text-3xl font-bold text-slate-900 mb-2">
              {isFr ? "Répertoire des boutiques" : "Stores Directory"}
            </h2>
            <p className="text-slate-600">
              {isFr ? "Une alternative textuelle à la carte interactive, regroupée par province." : "A text alternative to the interactive map, grouped by province."}
            </p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
              aria-label={isFr ? "Fermer le répertoire" : "Close directory"}
            >
              <X className="w-6 h-6 text-slate-700" />
            </button>
          )}
        </div>

        {sortedProvinces.length === 0 && (
          <p className="text-slate-500 py-8 italic">
            {isFr ? "Aucune boutique trouvée." : "No stores found."}
          </p>
        )}

        <div className="space-y-12">
          {sortedProvinces.map((prov) => (
            <section key={prov} aria-labelledby={`prov-${prov}`}>
              <h3 id={`prov-${prov}`} className="text-2xl font-bold text-slate-900 border-b-2 border-[#FFD700] pb-2 mb-6 inline-block">
                {prov}
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label={`Stores in ${prov}`}>
                {grouped[prov].map((store) => (
                  <li key={store.id} className="border border-slate-200 p-5 shadow-sm bg-slate-50 flex flex-col h-full">
                    <h4 className="font-semibold text-lg text-slate-900 mb-1">{store.name}</h4>
                    <p className="text-slate-700 mb-3">{store.address}, {store.city}</p>
                    
                    <div className="mt-auto space-y-2">
                      <p className="text-sm">
                        <span className="font-medium text-slate-900">{isFr ? "Catégorie :" : "Category:"}</span>{" "}
                        <span className="text-slate-600">{store.category}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-slate-900">{isFr ? "Produits :" : "Products:"}</span>{" "}
                        <span className="text-slate-600">{store.products.join(", ")}</span>
                      </p>
                      
                      {store.website && (
                        <div className="pt-3 mt-3 border-t border-slate-200">
                          <a 
                            href={store.website.startsWith('http') ? store.website : `https://${store.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[#0057B7] hover:underline font-medium text-sm flex items-center"
                            aria-label={`${isFr ? "Visiter le site web de" : "Visit website for"} ${store.name}`}
                          >
                            {isFr ? "Visiter le site web" : "Visit Website"}
                          </a>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
