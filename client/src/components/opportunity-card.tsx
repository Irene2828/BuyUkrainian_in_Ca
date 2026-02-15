import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface OpportunityCardProps {
    isVisible: boolean;
    onClear: () => void;
    onAddStore?: () => void;
}

export function OpportunityCard({ isVisible, onClear, onAddStore }: OpportunityCardProps) {
    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-full max-w-[340px] z-[500] pointer-events-auto"
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center shadow-xl border border-white/40 ring-1 ring-slate-900/5">
                    <h3 className="text-slate-900 font-semibold tracking-tight text-lg mb-2 text-center">
                        No stores here yet
                    </h3>

                    <p className="text-slate-500 text-[13px] leading-relaxed mb-6 font-ui px-2">
                        Know a place in this area selling Ukrainian products? Help us grow the map.
                    </p>

                    <div className="flex flex-col gap-3 items-center">
                        <button
                            onClick={() => onAddStore ? onAddStore() : window.dispatchEvent(new CustomEvent('openAddStoreModal'))}
                            className="group relative inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full text-[13px] font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add a Store</span>
                        </button>

                        <button
                            onClick={onClear}
                            className="text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
