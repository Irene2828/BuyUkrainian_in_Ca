import { Store } from "@/lib/data";
import { X, MapPin, Copy, Mail, Facebook, Twitter, Instagram, Sparkles, Check, ChevronDown, ChevronUp, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface StoreModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onSeeOnMap?: (store: Store) => void;
}

function generateShareTexts(store: Store) {
  const products = store.products.slice(0, 3).join(', ');
  const emoji = store.category === 'food' ? '🍞' : store.category === 'retail' ? '🛍️' : '🇺🇦';
  
  return {
    twitter: `${emoji} Just discovered ${store.name} - they sell authentic Ukrainian products like ${products}! Support local Ukrainian businesses in Canada 🇺🇦💙💛 #MadeInUkraine #BlueYellow #SupportUkraine`,
    facebook: `I found this amazing Ukrainian store called ${store.name}! 🇺🇦\n\nThey sell: ${products}\n📍 ${store.address}\n\n${store.description}\n\nSupport Ukrainian businesses in Canada! Find more at BlueYellow.ca 💙💛`,
    instagram: `🇺🇦 DISCOVER UKRAINIAN PRODUCTS 🇺🇦\n\n📍 ${store.name}\n\n${store.description}\n\n✨ Products: ${products}\n📍 Location: ${store.address.split(',')[0]}\n\n#MadeInUkraine #UkrainianProducts #SupportUkraine #BlueYellow #UkrainianBusiness #ShopLocal #UkrainianFood #CanadaUkraine #UkrainianCommunity #SlavaUkraini 💙💛`,
  };
}

export function StoreModal({ store, isOpen, onClose, onSeeOnMap }: StoreModalProps) {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showShareTexts, setShowShareTexts] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const shareTexts = useMemo(() => store ? generateShareTexts(store) : null, [store]);

  if (!store) return null;
  
  const handleCopyShareText = (platform: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    toast({
      title: "Copied!",
      description: `Share text for ${platform} copied to clipboard.`,
    });
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(store.address);
    toast({
      title: "Address Copied",
      description: "The address has been copied to your clipboard.",
    });
  };

  const handleSeeOnMap = () => {
    if (onSeeOnMap && store) {
      onSeeOnMap(store);
    }
  };

  const handleShare = (method: 'email' | 'facebook' | 'twitter') => {
    const text = `Check out ${store.name} on BlueYellow.ca! They sell: ${store.products.join(', ')}. Address: ${store.address}`;
    const url = "https://blueyellow.ca";
    
    if (method === 'email') {
      window.open(`mailto:?subject=Check out ${store.name}&body=${encodeURIComponent(text)}`);
    } else if (method === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`);
    } else if (method === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="store-modal" className="max-w-md p-0 max-h-[90vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
        <VisuallyHidden>
          <DialogTitle>{store.name}</DialogTitle>
        </VisuallyHidden>
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
                data-testid="button-see-on-map"
                variant="outline" 
                className="flex flex-col h-auto py-3 gap-1 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" 
                onClick={handleSeeOnMap}
              >
                <Map className="w-4 h-4 mb-1" />
                See on Map
              </Button>
            </div>

            {/* Social Media Share */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Share</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-blue-600 hover:text-blue-800 gap-1"
                  onClick={() => setShowShareTexts(!showShareTexts)}
                  data-testid="button-toggle-share-texts"
                >
                  <Sparkles className="w-3 h-3" />
                  AI Share Text
                  {showShareTexts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
              
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
                  title="Share on X (Twitter)"
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

              {showShareTexts && shareTexts && (
                <div className="mt-4 space-y-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-semibold text-foreground/80">Ready-to-post texts</span>
                  </div>
                  
                  {/* X (Twitter) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Twitter className="w-3 h-3 text-sky-500" />
                        <span className="text-[10px] font-semibold uppercase text-sky-600">X (Twitter)</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleCopyShareText('twitter', shareTexts.twitter)}
                        data-testid="button-copy-twitter-text"
                      >
                        {copiedPlatform === 'twitter' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground bg-white dark:bg-gray-900 p-2 rounded border line-clamp-3">
                      {shareTexts.twitter}
                    </p>
                  </div>

                  {/* Facebook */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Facebook className="w-3 h-3 text-blue-600" />
                        <span className="text-[10px] font-semibold uppercase text-blue-600">Facebook</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleCopyShareText('facebook', shareTexts.facebook)}
                        data-testid="button-copy-facebook-text"
                      >
                        {copiedPlatform === 'facebook' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground bg-white dark:bg-gray-900 p-2 rounded border line-clamp-3 whitespace-pre-line">
                      {shareTexts.facebook}
                    </p>
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Instagram className="w-3 h-3 text-pink-500" />
                        <span className="text-[10px] font-semibold uppercase text-pink-600">Instagram</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleCopyShareText('instagram', shareTexts.instagram)}
                        data-testid="button-copy-instagram-text"
                      >
                        {copiedPlatform === 'instagram' ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground bg-white dark:bg-gray-900 p-2 rounded border line-clamp-4 whitespace-pre-line">
                      {shareTexts.instagram}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
