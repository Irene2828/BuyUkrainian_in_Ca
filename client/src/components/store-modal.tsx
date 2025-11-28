import { Store } from "@/lib/data";
import { X, MapPin, Copy, Mail, MessageSquare, Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface StoreModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StoreModal({ store, isOpen, onClose }: StoreModalProps) {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!store) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(store.address);
    toast({
      title: "Address Copied",
      description: "The address has been copied to your clipboard.",
    });
  };

  const handleShare = (method: 'email' | 'sms' | 'facebook' | 'twitter') => {
    const text = `Check out ${store.name} on BlueYellow.ca! They sell: ${store.products.join(', ')}. Address: ${store.address}`;
    const url = "https://blueyellow.ca";
    
    if (method === 'email') {
      window.open(`mailto:?subject=Check out ${store.name}&body=${encodeURIComponent(text)}`);
    } else if (method === 'sms') {
      window.open(`sms:?body=${encodeURIComponent(text)}`);
    } else if (method === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`);
    } else if (method === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="store-modal" className="max-w-md p-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Image Area */}
        <div className="relative bg-gray-100 w-full h-48">
          {store.image ? (
            <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-accent/20">
              <MapPin className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span data-testid="store-category" className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider">
                {store.category}
              </span>
              {store.status === 'pending' && (
                <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider">
                  Pending Review
                </span>
              )}
            </div>
            <h2 data-testid="store-name" className="text-2xl font-bold leading-tight mb-2">{store.name}</h2>
            <p data-testid="store-description" className="text-muted-foreground text-sm leading-relaxed">
              {store.description}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground/80">Products</h3>
              <div className="flex flex-wrap gap-2">
                {store.products.map((product, i) => (
                  <span key={i} data-testid={`product-${i}`} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                    {product}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground/80">Location</h3>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p data-testid="store-address" className="text-sm text-muted-foreground">{store.address}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <Button 
                data-testid="button-copy-address"
                variant="outline" 
                className="flex flex-col h-auto py-3 gap-1 text-xs" 
                onClick={handleCopyAddress}
              >
                <Copy className="w-4 h-4 mb-1" />
                Copy
              </Button>
              <Button 
                data-testid="button-send-email"
                variant="outline" 
                className="flex flex-col h-auto py-3 gap-1 text-xs" 
                onClick={() => handleShare('email')}
              >
                <Mail className="w-4 h-4 mb-1" />
                Email
              </Button>
              <Button 
                data-testid="button-send-sms"
                variant="outline" 
                className="flex flex-col h-auto py-3 gap-1 text-xs" 
                onClick={() => handleShare('sms')}
              >
                <MessageSquare className="w-4 h-4 mb-1" />
                Text
              </Button>
            </div>

            {/* Social Media Share */}
            <div>
              <h3 className="text-xs font-semibold mb-2 text-foreground/80 uppercase tracking-wider">Share</h3>
              <div className="flex gap-2">
                <Button 
                  data-testid="button-share-facebook"
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-9 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  onClick={() => handleShare('facebook')}
                  title="Share on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button 
                  data-testid="button-share-twitter"
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-9 rounded-lg hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
                  onClick={() => handleShare('twitter')}
                  title="Share on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button 
                  data-testid="button-share-instagram"
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-9 rounded-lg hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                  onClick={() => window.open('https://www.instagram.com')}
                  title="Share on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
