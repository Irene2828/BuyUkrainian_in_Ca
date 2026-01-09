import { useState } from 'react';
import { X, Copy, Mail, Facebook, Twitter, Instagram, Sparkles, ChevronDown, ChevronRight, Map, MapPin, Check, Clock } from 'lucide-react';
import { Store } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface StoreCardProps {
    store: Store;
    onClose: () => void;
    onSeeOnMap?: (store: Store) => void;
}

export function StoreCard({ store, onClose, onSeeOnMap }: StoreCardProps) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(store.address);
        setCopied(true);
        // Haptic feedback simulation
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: store.name,
                    text: `Check out ${store.name} on BuyUkrainian.ca!`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            toast({ title: "Shared!", description: `Store details copied to clipboard.` });
            navigator.clipboard.writeText(`${store.name} - ${window.location.href}`);
        }
    };

    return (
        <div className="w-full bg-white md:rounded-[32px] rounded-t-[32px] overflow-hidden font-sans border-0 md:border md:border-gray-100 flex flex-col relative md:shadow-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.05)] animate-in fade-in slide-in-from-bottom-10 md:zoom-in-95 duration-[400ms] ease-in-out">
            {/* Grab Handle - Mobile Only */}
            <div className="w-full flex justify-center pt-3 pb-1 md:hidden" onClick={onClose}>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="p-4 md:p-6 overflow-y-auto max-h-[85vh] md:max-h-[90vh] custom-scrollbar scrollbar-hide">
                {/* Close Button - Desktop Only */}
                <button
                    onClick={onClose}
                    className="hidden md:block absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* Content Hierarchy: Title First */}
                <div className="mb-4">
                    {/* Category Tags */}
                    <div className="flex gap-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-normal uppercase tracking-wider bg-gray-100 text-gray-500 font-ui">
                            {store.category || "FOOD"}
                        </span>
                        {store.isOpen && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-normal uppercase tracking-wider bg-green-50 text-green-600 font-ui">
                                Open
                            </span>
                        )}
                    </div>

                    {/* Title: The Norman Way */}
                    <h2 className="text-xl md:text-[24px] font-bold tracking-tight text-[#1A1A1A] leading-tight mb-2 pr-8 font-header">
                        {store.name}
                    </h2>

                    {/* Description */}
                    <p className="text-[15px] text-[#717171] leading-relaxed font-ui line-clamp-2">
                        {store.description || "Carries Ukrainian products"}
                    </p>
                </div>

                {/* Address & Hours with Icons */}
                <div className="mb-6 flex flex-col gap-3">
                    <button
                        onClick={handleCopyAddress}
                        className="flex items-start gap-3 text-left group active:scale-95 transition-transform duration-200"
                    >
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0 group-hover:text-black transition-colors" />
                        <div className="flex-1">
                            <span className="text-[13px] text-gray-500 font-normal font-ui block group-hover:text-black transition-colors">
                                {store.address}
                            </span>
                        </div>
                        {copied ? <Check className="w-4 h-4 text-green-500 shrink-0" /> : <Copy className="w-4 h-4 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-[13px] text-gray-500 font-normal font-ui">
                            Open today: 9:00 AM - 8:00 PM
                        </span>
                    </div>
                </div>

                {/* Store Images Preview */}
                <div className="mb-6">
                    <div className="bg-[#F8F9FA] rounded-[20px] p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100/50 transition-all border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-[60px] h-[60px] bg-white rounded-[16px] border border-gray-100 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                                {store.images?.[0] ?
                                    <img src={store.images[0]} className="w-full h-full object-cover" alt={store.name} /> :
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-300">PHOTO</div>
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-[#1A1A1A] line-clamp-1 font-ui">
                                    Photos & Products
                                </p>
                                <p className="text-[12px] text-gray-400 font-ui truncate">
                                    View {store.products.length}+ items
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                    </div>
                </div>

                {/* Action Buttons: Directions Primary, others Secondary */}
                <div className="flex flex-col gap-3 mt-auto pt-2">
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 h-12 bg-black text-white rounded-full font-bold text-[14px] shadow-sm hover:bg-black/90 active:scale-95 transition-all font-ui"
                    >
                        <MapPin className="w-4 h-4" /> Get Directions
                    </a>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onSeeOnMap ? () => onSeeOnMap(store) : undefined}
                            className="flex items-center justify-center gap-2 h-12 bg-gray-100 text-black rounded-full font-bold text-[14px] hover:bg-gray-200 active:scale-95 transition-all font-ui"
                        >
                            <Map className="w-4 h-4" /> See on Map
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 h-12 bg-gray-100 text-black rounded-full font-bold text-[14px] hover:bg-gray-200 active:scale-95 transition-all font-ui"
                        >
                            <Sparkles className="w-4 h-4" /> Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
