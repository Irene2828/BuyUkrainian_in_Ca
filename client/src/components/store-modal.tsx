import { Store } from "@/lib/data";
import { X, MapPin, Copy, Mail, Facebook, Twitter, Instagram, Sparkles, Map as MapIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface StoreModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onSeeOnMap?: (store: Store) => void;
}

export function StoreModal({ store, isOpen, onClose, onSeeOnMap }: StoreModalProps) {
  const { toast } = useToast();
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!store) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(store.address);
    toast({ title: "Address Copied", description: "Store location is now on your clipboard." });
  };

  const handleEmailAddress = () => {
    const text = `Check out ${store.name} at ${store.address}`;
    window.open(`mailto:?subject=Check out ${store.name}&body=${encodeURIComponent(text)}`);
  };

  const handleSeeOnMap = () => {
    if (onSeeOnMap && store) {
      onSeeOnMap(store);
      onClose();
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'instagram') => {
    const text = `Check out ${store.name} - ${store.description}`;
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(text);
      toast({ title: "Share Text Copied", description: "Paste this in your Instagram post!" });
    }
  };

  const categoryLabel = store.category === 'food' ? 'FOOD' :
    store.category === 'clothes' ? 'CLOTHING' :
      store.category === 'retail' ? 'RETAIL' : 'MIXED';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[680px] p-0 overflow-hidden border-none bg-white rounded-[40px] shadow-2xl font-sans"
        hideClose
        onClick={(e) => {
          // Close when clicking the backdrop
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="px-12 py-12 animate-in fade-in zoom-in-95 duration-300">
          {/* Store Name */}
          <h2 className="text-[32px] font-bold leading-[1.1] text-black mb-2 font-header">
            {store.name}
          </h2>

          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-[14px] font-bold uppercase tracking-wider text-gray-500 font-ui">
              {categoryLabel}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-[14px] font-bold uppercase tracking-wider text-gray-500 font-ui">
              MIXED
            </span>
          </div>

          {/* Description Card */}
          <div className="bg-gray-50 rounded-[24px] p-8 mb-8 flex items-start gap-6">
            {/* Image Placeholder */}
            <div className="w-[120px] h-[120px] bg-gray-200 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
              {store.images?.[0] ? (
                <img src={store.images[0]} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold uppercase text-gray-400">Img</span>
              )}
            </div>

            {/* Description Text */}
            <div className="flex-1">
              <p className="text-[16px] text-gray-700 leading-relaxed mb-3 font-ui">
                {showFullDescription ? store.description : store.description.slice(0, 100) + (store.description.length > 100 ? '...' : '')}
              </p>
              {store.description.length > 100 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-black text-[14px] font-bold hover:underline font-ui"
                >
                  {showFullDescription ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-4 mb-8">
            <MapPin className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
            <p className="text-[18px] text-gray-700 leading-relaxed font-ui">
              {store.address}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <button
              onClick={handleCopyAddress}
              className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-gray-100 rounded-[20px] py-6 hover:border-black hover:bg-gray-50 transition-all group"
            >
              <Copy className="w-6 h-6 text-black" />
              <span className="text-[14px] font-semibold text-gray-700 group-hover:text-black font-ui">
                Copy Address
              </span>
            </button>

            <button
              onClick={handleEmailAddress}
              className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-gray-100 rounded-[20px] py-6 hover:border-black hover:bg-gray-50 transition-all group"
            >
              <Mail className="w-6 h-6 text-black" />
              <span className="text-[14px] font-semibold text-gray-700 group-hover:text-black font-ui">
                Email Address
              </span>
            </button>

            <button
              onClick={handleSeeOnMap}
              className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-gray-100 rounded-[20px] py-6 hover:border-black hover:bg-gray-50 transition-all group"
            >
              <MapIcon className="w-6 h-6 text-black" />
              <span className="text-[14px] font-semibold text-gray-700 group-hover:text-black font-ui">
                Map
              </span>
            </button>
          </div>

          {/* Share Section */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              onClick={() => {
                const shareText = `Check out ${store.name} - ${store.description}`;
                navigator.clipboard.writeText(shareText);
                toast({ title: "Share Text Copied", description: "Ready to share!" });
              }}
              className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[14px] font-bold font-ui">AI Share Text</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition-all"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition-all"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition-all"
              >
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
