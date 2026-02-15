import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import { Store } from "@/lib/data";
import { StoreCard } from "@/components/store-card";
import { X, ChevronUp, MapPin, Globe, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreBottomSheetProps {
    store: Store | null;
    onClose: () => void;
    onSeeOnMap?: (store: Store) => void;
}

const SNAPS = {
    MIN: 0.12, // Reduced to show just the name/handle clearly
    MID: 0.6,
    MAX: 0.95
};

export function StoreBottomSheet({ store, onClose, onSeeOnMap }: StoreBottomSheetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const y = useMotionValue(0);
    const [activeSnap, setActiveSnap] = useState<"min" | "mid" | "max">("min");

    // Calculate window height for snap points
    const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (store) {
            // Initial entrance - snap to MIN or MID? 
            // User requested "Collapsed: Only store name and handle... approx 10% height"
            // Let's start at MIN
            snapTo("min");
        } else {
            // Exit animation
            controls.start({ y: windowHeight });
        }
    }, [store]);

    const snapTo = (snap: "min" | "mid" | "max") => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(5); // Haptic "Thud"
        }
        const targetY = windowHeight * (1 - SNAPS[snap.toUpperCase() as keyof typeof SNAPS]);
        controls.start({
            y: targetY,
            transition: {
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8
            }
        });
        setActiveSnap(snap);
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        const velocity = info.velocity.y;
        const currentY = y.get();
        const percentY = 1 - (currentY / windowHeight);

        // Velocity-based flick
        if (Math.abs(velocity) > 500) {
            if (velocity < 0) {
                // Flick Up
                if (activeSnap === "min") snapTo("mid");
                else if (activeSnap === "mid") snapTo("max");
            } else {
                // Flick Down
                if (activeSnap === "max") snapTo("mid");
                else if (activeSnap === "mid") snapTo("min");
                else onClose(); // Close if flickering down from min
            }
            return;
        }

        // Position-based snap
        if (percentY < 0.2) {
            onClose();
        } else if (percentY < 0.4) {
            snapTo("min");
        } else if (percentY < 0.8) {
            snapTo("mid");
        } else {
            snapTo("max");
        }
    };

    if (!store) return null;

    return (
        <>
            {/* Backdrop for Max State only - subtle dimming */}
            {activeSnap === "max" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[5000]"
                    onClick={() => snapTo("mid")} // Tap outside to peek
                />
            )}

            <motion.div
                ref={containerRef}
                drag="y"
                dragConstraints={{ top: windowHeight * (1 - SNAPS.MAX), bottom: windowHeight }}
                dragElastic={0.05} // Rubber-band effect
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={controls}
                initial={{ y: windowHeight }} // Start off-screen
                style={{ y }}
                className="fixed left-0 right-0 z-[5001] bg-white/90 backdrop-blur-xl rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-white/50 ring-1 ring-black/5 overflow-hidden flex flex-col will-change-transform"
                // Ensure height covers the drag area
                custom={windowHeight} // Pass for dynamic variants if needed
                layout
            >
                {/* Handle Bar Area - The "Don Norman" Affordance */}
                <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                {/* Header Content (Always Visible in Min State) */}
                <div className="px-6 pb-4 border-b border-transparent transition-colors duration-300"
                    // Add a subtle border when expanded?
                    style={{ borderColor: activeSnap !== 'min' ? 'rgba(226, 232, 240, 0.5)' : 'transparent' }}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold tracking-wider uppercase mb-1">
                                {store.category}
                            </span>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">
                                {store.name}
                            </h2>
                            {activeSnap === 'min' && (
                                <p className="text-sm text-slate-500 mt-1 truncate max-w-[280px]">
                                    {store.address} • {store.city}
                                </p>
                            )}
                        </div>

                        {/* Close logic for Mobile? Or just drag down? */}
                        {/* Let's keep a small close button for accessibility */}
                        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 ml-4">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Area (Visible in Mid/Max) */}
                <div className="flex-1 overflow-y-auto px-4 pb-8 bg-transparent">
                    {/* Reuse StoreCard structure but adapt for full width? 
                Actually, StoreCard is designed as a compact card. 
                For the detail view, we might want a slightly different layout or just wrap StoreCard content.
                Let's use the StoreCard but strip its container styling if possible, or just render similar content.
                Given the complexity, let's render a custom view here reusing data.
            */}

                    <div className="mt-4 space-y-6">
                        {/* Image */}
                        {(store.image || store.images?.[0]) ? (
                            <div className="w-full h-48 rounded-2xl bg-slate-100 overflow-hidden relative shadow-sm">
                                <img
                                    src={store.image || store.images?.[0]}
                                    alt={store.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-32 rounded-2xl bg-slate-50 flex items-center justify-center border border-dashed border-slate-200">
                                <span className="text-slate-400 text-sm">No image available</span>
                            </div>
                        )}

                        {/* Action Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address + ", " + store.city)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium text-sm shadow-sm hover:bg-blue-700 active:scale-95 transition-all">
                                <MapPin size={16} /> Get Directions
                            </a>
                            {store.website && (
                                <a href={store.website} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-medium text-sm hover:bg-slate-50 active:scale-95 transition-all">
                                    <Globe size={16} /> Visit Website
                                </a>
                            )}
                        </div>

                        {/* Products */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Available Products</h3>
                            <div className="flex flex-wrap gap-2">
                                {store.products.map((product, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600">
                                        {product}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Full Address */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase">Location</h3>
                            <p className="text-slate-700 font-medium">
                                {store.address}
                            </p>
                            <p className="text-slate-500 text-sm">
                                {store.city}, {store.province}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
