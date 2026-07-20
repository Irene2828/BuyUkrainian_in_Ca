import { Store } from "@/lib/data";
import { Image, ChevronRight } from "lucide-react";

interface StoreListProps {
  stores: Store[];
  onSelectStore: (store: Store) => void;
}

export function StoreList({ stores, onSelectStore }: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-ui">No stores found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Admin-Style Row Container */}
      <div className="flex flex-col divide-y divide-gray-100">
        {stores.map((store) => (
          <div
            key={store.id}
            className="h-[72px] flex items-center justify-between px-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onSelectStore(store)}
            data-testid={`list-item-store-${store.id}`}
          >
            {/* Left - Small Thumbnail (40x40) */}
            <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
              {store.image ? (
                <img src={store.image} className="w-full h-full object-cover" alt={store.name} />
              ) : (
                <Image className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Center - Store Info */}
            <div className="flex-1 min-w-0 ml-4">
              <p
                data-testid={`store-name-${store.id}`}
                className="text-[15px] font-semibold text-gray-900 truncate font-ui"
              >
                {store.name}
              </p>
              <p className="text-[13px] text-gray-400 truncate font-ui">
                {store.address}
              </p>
            </div>

            {/* Right - Chevron Only */}

          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-[12px] text-gray-500 font-ui">
        Showing {stores.length} {stores.length === 1 ? 'store' : 'stores'}
      </div>
    </div>
  );
}
