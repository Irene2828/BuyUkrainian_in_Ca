import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { Store } from "@/lib/data";
import { StoreCard } from "@/components/store-card";

interface StoreBottomSheetProps {
    store: Store | null;
    onClose: () => void;
    onSeeOnMap?: (store: Store) => void;
    userLocation?: [number, number] | null;
}

export function StoreBottomSheet({ store, onClose, onSeeOnMap, userLocation }: StoreBottomSheetProps) {

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.y > 100) {
            onClose();
        }
    };

    if (!store) return null;
    if (typeof document === 'undefined') return null;

    return createPortal(
        <>
            {/* Scale-up / Slide-up Wrapper */}
            <div className="fixed inset-0 z-[5001] pointer-events-none flex flex-col justify-end items-center pb-8 safe-area-bottom">
                <motion.div
                    initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }} // Elastic drag
                    dragElastic={{ top: 0, bottom: 0.2 }}
                    onDragEnd={handleDragEnd}
                    className="pointer-events-auto cursor-grab active:cursor-grabbing w-full flex justify-center px-4"
                >
                    {/* 
                        Reuse the exact Desktop StoreCard.
                        We enable responsive sizing via the className prop we just added.
                    */}
                    <StoreCard
                        store={store}
                        onClose={onClose}
                        onSeeOnMap={onSeeOnMap}
                        className="w-full max-w-[400px]"
                        userLocation={userLocation}
                    />
                </motion.div>
            </div>
        </>,
        document.body
    );
}
