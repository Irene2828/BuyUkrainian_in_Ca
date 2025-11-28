import { Store } from "@/lib/data";
import { MapPin, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StoreListProps {
  stores: Store[];
  onSelectStore: (store: Store) => void;
}

export function StoreList({ stores, onSelectStore }: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No stores found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stores.map((store, idx) => (
        <motion.div
          key={store.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: idx * 0.05 }}
          className="border rounded-lg p-4 hover:border-blue-accent hover:bg-blue-50/50 transition-all cursor-pointer"
          onClick={() => onSelectStore(store)}
          data-testid={`list-item-store-${store.id}`}
        >
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-20 h-20 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
              {store.image ? (
                <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-300" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 data-testid={`store-name-${store.id}`} className="font-semibold text-foreground truncate">{store.name}</h3>
                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                  {store.category}
                </span>
              </div>
              <p data-testid={`store-description-${store.id}`} className="text-sm text-muted-foreground line-clamp-2 mb-2">{store.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{store.address.split(",")[0]}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {store.products.slice(0, 3).map((product, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded">
                    {product}
                  </span>
                ))}
                {store.products.length > 3 && (
                  <span className="px-2 py-0.5 text-[11px] text-muted-foreground">+{store.products.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
