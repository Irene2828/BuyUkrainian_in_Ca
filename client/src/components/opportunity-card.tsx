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
                <div className="bg-white/80 backdrop-blur-xl rounded-[20px] p-6 text-center shadow-xl border border-white/40 ring-1 ring-slate-900/5">
                    <h3 className="text-slate-900 font-semibold tracking-tight text-lg mb-2 text-center">
                        No stores here yet
                    </h3>

                    <p className="text-slate-500 text-[13px] leading-relaxed mb-6 font-ui px-2">
                        Know a place in this area selling Ukrainian products? Help us grow the map.
                    </p>

                    <div className="flex flex-col gap-3 items-center">
                        <button
                            onClick={() => onAddStore ? onAddStore() : window.dispatchEvent(new CustomEvent('openAddStoreModal'))}
                            className="group relative inline-flex items-center justify-center gap-2.5 bg-[#FFD700] text-[#0057B7] px-6 py-2.5 rounded-[32px] text-[14px] font-medium tracking-normal transition-all duration-300 shadow-none hover:bg-[#0057B7] hover:text-white hover:scale-[1.02] active:scale-95 border border-[#FFD700] hover:border-[#0057B7]"
                        >
                            <span>Add a Store</span>
                            <Plus className="w-4 h-4 text-current transition-transform duration-300 group-hover:scale-110" />
                        </button>

                        <button
                            onClick={onClear}
                            className="inline-flex items-center justify-center h-9 px-4 rounded-[32px] border border-[#0057B7]/20 bg-white/55 text-[#0057B7] text-[13px] font-medium tracking-normal transition-all duration-300 hover:border-[#0057B7] hover:bg-white/75 hover:scale-[1.02] active:scale-95"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
