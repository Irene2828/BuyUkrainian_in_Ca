import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getApprovedStores } from "@/lib/api";
import { Facebook, Instagram, Plus } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export function CommunityImpact({ hideBorder = false }: { hideBorder?: boolean }) {
    const { data: stores = [] } = useQuery({
        queryKey: ["stores"],
        queryFn: getApprovedStores,
    });

    const shareMessage = "Find or add stores that sell Ukrainian-made products.🇺🇦🇨🇦\nLet’s make it easy to buy Ukrainian in Canada.";
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://buyukrainian.ca';

    const handleFacebookShare = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareMessage)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    const handleInstagramShare = () => {
        navigator.clipboard.writeText(`${shareMessage}\n\n${shareUrl}`);
        toast.success("Copied to clipboard", {
            description: "Paste this into your Instagram story or post.",
            duration: 3000,
        });
    };

    const handleXShare = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };

    return (
        <section className={cn(
            "relative w-full bg-white py-[clamp(4rem,8vh,8rem)] px-[clamp(1.5rem,5vw,4rem)] section-reveal flex items-center min-h-[468px] overflow-hidden",
            !hideBorder && "border-t border-slate-100"
        )}>
            {/* Background Blobs */}
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: '600px',
                    height: '600px',
                    left: 'calc(50% - 714px)',
                    top: '-300px',
                    background: 'rgba(0, 113, 227, 0.16)',
                    filter: 'blur(120px)',
                    zIndex: 0
                }}
            />
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: '500px',
                    height: '500px',
                    left: 'calc(50% + 225px)',
                    top: '335px',
                    background: 'rgba(255, 212, 39, 0.23)',
                    filter: 'blur(100px)',
                    zIndex: 0
                }}
            />

            <div className="boutique-width w-full relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-center md:text-left">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-premium-pulse" />
                            <p className="text-[13px] font-bold tracking-[0.08em] text-slate-900/70 uppercase whitespace-nowrap m-0 font-ui">
                                How You Can Help
                            </p>
                        </div>
                        <h2 className="text-[32px] md:text-[42px] font-semibold text-slate-900 leading-tight mb-4 stagger-item max-w-[15ch]">
                            Supporting resilience, one store at a time.
                        </h2>
                        <p className="text-[17px] text-[#424245] font-ui leading-relaxed max-w-[45ch] mx-auto md:mx-0 mb-8">
                            We're creating a community-driven resource to help you find and support Ukrainian makers and entrepreneurship across Canada.
                        </p>

                        <Link href="/map">
                            <button className="btn-premium-action shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 no-invert-hover group">
                                <Plus className="w-5 h-5 mr-1" strokeWidth={2.5} />
                                <span>Explore the Map</span>
                            </button>
                        </Link>
                    </div>

                    <div className="flex flex-col items-center md:items-end">
                        <span className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-8 font-ui invisible">
                            Share the map:
                        </span>

                        <ul className="flex flex-col items-center md:items-end gap-6 list-none p-0 m-0">
                            <li>
                                <button
                                    onClick={handleFacebookShare}
                                    className="flex items-center gap-3 px-4 h-[44px] text-[15px] font-medium text-slate-900 transition-all duration-300 hover:opacity-100 group relative"
                                >
                                    <Facebook className="w-4 h-4 text-slate-900" />
                                    <span>Share on Facebook</span>
                                    <span className="absolute bottom-[2px] left-4 right-4 h-[1px] bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleInstagramShare}
                                    className="flex items-center gap-3 px-4 h-[44px] text-[15px] font-medium text-slate-900 transition-all duration-300 hover:opacity-100 group relative"
                                >
                                    <Instagram className="w-4 h-4 text-slate-900" />
                                    <span>Share on Instagram</span>
                                    <span className="absolute bottom-[2px] left-4 right-4 h-[1px] bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleXShare}
                                    className="flex items-center gap-3 px-4 h-[44px] text-[15px] font-medium text-slate-900 transition-all duration-300 hover:opacity-100 group relative"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="w-4 h-4 fill-slate-900"
                                        aria-hidden="true"
                                    >
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                    </svg>
                                    <span>Share on X</span>
                                    <span className="absolute bottom-[2px] left-4 right-4 h-[1px] bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section >
    );
}
