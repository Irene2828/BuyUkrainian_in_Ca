import { X, Copy, Mail, Facebook, Twitter, Instagram, Sparkles, ChevronDown, ChevronRight, Map } from 'lucide-react';
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

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(store.address);
        toast({ title: "Address Copy", description: "Address copied to clipboard." });
    };

    const handleShare = (platform: string) => {
        toast({ title: "Shared!", description: `Store details shared to ${platform}.` });
    };

    return (
        <div className="w-full max-w-[400px] bg-white rounded-[32px] overflow-hidden font-sans border border-gray-100 flex flex-col relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 overflow-y-auto max-h-[90vh] custom-scrollbar scrollbar-hide">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all z-10"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                {/* Category: FOOD (Small caps, bold, 12px, Inter, deep grey) */}
                <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#4A4A4A] mb-2 block font-ui">
                    {store.category || "FOOD"}
                </span>

                {/* Store Name: Lora Bold, 28px, tight line-height */}
                <h2 className="text-[28px] font-bold leading-[1.1] text-[#1A1A1A] mb-2 pr-8 font-header">
                    {store.name}
                </h2>

                {/* Subtitle / Description: Inter, 16px, muted grey */}
                <p className="text-[16px] text-[#717171] font-normal leading-normal mb-6 font-ui">
                    {store.description || "Carries Ukrainian products"}
                </p>

                {/* What you can buy section */}
                <div className="mb-6">
                    <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-3 font-ui">What you can buy here:</h3>
                    <div className="bg-[#F8F9FA] rounded-[20px] p-3 flex items-center justify-between group cursor-pointer hover:bg-gray-100/50 transition-all">
                        <div className="flex-1 flex flex-col gap-1 pr-3">
                            <p className="text-[14px] text-[#4A4A4A] leading-snug font-normal line-clamp-2 font-ui">
                                "{store.products.join(', ')} and more Ukrainian products."
                            </p>
                            <span className="text-[13px] font-bold text-black font-ui mt-1">... See more</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-[60px] h-[60px] bg-white rounded-[16px] border border-gray-100 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                                {store.images?.[0] ?
                                    <img src={store.images[0]} className="w-full h-full object-cover" alt={store.name} /> :
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[10px] text-gray-300">PHOTO</div>
                                }
                            </div>
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50 text-gray-400">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Section */}
                <div className="mb-6">
                    <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-3 font-ui">Location</h3>
                    <div className="w-full h-14 bg-white border border-gray-200 rounded-[12px] px-4 flex items-center gap-3 mb-4 shadow-sm">
                        <Map className="w-5 h-5 text-gray-400" />
                        <span className="text-[15px] font-normal text-[#4A4A4A] truncate font-ui">
                            {store.address}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleCopyAddress}
                            className="flex items-center gap-2 px-4 h-11 bg-gray-100 text-black rounded-full font-bold text-[13px] hover:bg-gray-200 transition-all font-ui"
                        >
                            <Copy className="w-4 h-4" /> Copy Address
                        </button>
                        <button
                            onClick={() => handleShare('email')}
                            className="flex items-center gap-2 px-4 h-11 bg-gray-100 text-black rounded-full font-bold text-[13px] hover:bg-gray-200 transition-all font-ui"
                        >
                            <Mail className="w-4 h-4" /> Email Address
                        </button>
                        <button
                            onClick={() => onSeeOnMap?.(store)}
                            className="flex items-center gap-2 px-4 h-11 bg-gray-100 text-black rounded-full font-bold text-[13px] hover:bg-gray-200 transition-all font-ui"
                        >
                            <Map className="w-4 h-4" /> See on Map
                        </button>
                    </div>
                </div>

                {/* Share Section */}
                <div className="mt-8 border-t border-gray-50 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.1em] font-ui">SHARE</h3>
                        <button className="flex items-center gap-1.5 text-[12px] font-bold text-black hover:underline font-ui transition-all">
                            <Sparkles className="w-3.5 h-3.5" /> Add AI Written Share Text <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button className="h-[52px] rounded-[12px] border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all text-black">
                            <Facebook className="w-6 h-6" />
                        </button>
                        <button className="h-[52px] rounded-[12px] border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all text-black">
                            <Twitter className="w-6 h-6" />
                        </button>
                        <button className="h-[52px] rounded-[12px] border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all text-black">
                            <Instagram className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
