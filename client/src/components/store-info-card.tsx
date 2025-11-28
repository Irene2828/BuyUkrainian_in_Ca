import { Store } from "@/lib/data";
import { X, MapPin, Copy, Mail, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface StoreInfoCardProps {
  store: Store;
  onClose: () => void;
}

export function StoreInfoCard({ store, onClose }: StoreInfoCardProps) {
  const { toast } = useToast();

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(store.address);
    toast({
      title: "Address Copied",
      description: "The address has been copied to your clipboard.",
    });
  };

  const handleShare = (method: 'email' | 'sms') => {
    const text = `Check out ${store.name} on BlueYellow.ca! They sell: ${store.products.join(', ')}. Address: ${store.address}`;
    if (method === 'email') {
      window.open(`mailto:?subject=Check out ${store.name}&body=${encodeURIComponent(text)}`);
    } else {
      window.open(`sms:?body=${encodeURIComponent(text)}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col h-full md:h-auto"
    >
      {/* Header Image */}
      <div className="h-48 w-full bg-gray-100 relative">
        {store.image ? (
          <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-accent/20">
            <MapPin className="w-12 h-12" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full h-8 w-8"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider">
              {store.category}
            </span>
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-2">{store.name}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {store.description}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground/80">Products</h3>
            <div className="flex flex-wrap gap-2">
              {store.products.map((product, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                  {product}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-foreground/80">Location</h3>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{store.address}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <Button variant="outline" className="flex flex-col h-auto py-3 gap-1 text-xs" onClick={handleCopyAddress}>
            <Copy className="w-4 h-4 mb-1" />
            Copy
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-3 gap-1 text-xs" onClick={() => handleShare('email')}>
            <Mail className="w-4 h-4 mb-1" />
            Email
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-3 gap-1 text-xs" onClick={() => handleShare('sms')}>
            <MessageSquare className="w-4 h-4 mb-1" />
            Text
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
