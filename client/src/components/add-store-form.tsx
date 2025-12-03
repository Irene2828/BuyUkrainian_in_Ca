import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Store } from "@/lib/data";
import { X, Upload, ChevronRight, CheckCircle, MapPin, Loader2, Store as StoreIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createStore, getApprovedStores } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const formSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  products: z.string().min(2, "List at least one product"),
  address: z.string().min(5, "Address is required"),
  category: z.enum(["food", "clothes", "other"]),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().optional(),
});

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  if (query.length < 3) return [];
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=ca&format=json&limit=5&addressdetails=1`,
      { headers: { 'Accept': 'application/json' } }
    );
    return await response.json();
  } catch (error) {
    console.error("Address search error:", error);
    return [];
  }
}

async function geocodeAddress(address: string): Promise<[number, number]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)},Canada&format=json&limit=1`,
      { headers: { 'Accept': 'application/json' } }
    );
    const results = await response.json();
    if (results && results[0]) {
      const lat = parseFloat(results[0].lat);
      const lng = parseFloat(results[0].lon);
      if (lat > 40 && lat < 85 && lng > -140 && lng < -50) {
        return [lat, lng];
      }
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return [43.6532, -79.3832];
}

interface AddStoreFormProps {
  onAdd: (store: Store) => void;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AddStoreForm({ onAdd, onClose, isCollapsed = false, onToggleCollapse }: AddStoreFormProps) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [existingStores, setExistingStores] = useState<Store[]>([]);
  const [storeSuggestions, setStoreSuggestions] = useState<Store[]>([]);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getApprovedStores().then((stores: Store[]) => setExistingStores(stores)).catch(() => {});
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      products: "",
      address: "",
      category: "food",
      email: "",
      website: "",
    },
  });

  const handleAddressChange = (value: string) => {
    if (addressDebounceRef.current) {
      clearTimeout(addressDebounceRef.current);
    }
    
    if (value.length >= 3) {
      setIsSearchingAddress(true);
      addressDebounceRef.current = setTimeout(async () => {
        const suggestions = await searchAddresses(value);
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(suggestions.length > 0);
        setIsSearchingAddress(false);
      }, 300);
    } else {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }
  };

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    form.setValue("address", suggestion.display_name);
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleNameChange = (value: string) => {
    if (value.length >= 2) {
      const matches = existingStores.filter(store => 
        store.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 3);
      setStoreSuggestions(matches);
      setShowStoreSuggestions(matches.length > 0);
    } else {
      setStoreSuggestions([]);
      setShowStoreSuggestions(false);
    }
  };

  const handleStoreSelect = (store: Store) => {
    form.setValue("name", store.name);
    form.setValue("address", store.address);
    form.setValue("description", store.description);
    form.setValue("products", store.products.join(", "));
    const categoryMap: Record<string, "food" | "clothes" | "other"> = {
      "retail": "clothes",
      "food": "food",
      "clothes": "clothes",
      "other": "other"
    };
    form.setValue("category", categoryMap[store.category] || "other");
    setShowStoreSuggestions(false);
    toast({
      title: t("form.storeExists") || "Store already exists",
      description: t("form.storeExistsDesc") || "This store is already on our map. You can view it there.",
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.website) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const [latitude, longitude] = await geocodeAddress(values.address);
      
      const newStore = await createStore({
        name: values.name,
        description: values.description,
        products: values.products.split(",").map(p => p.trim()),
        address: values.address,
        latitude,
        longitude,
        category: values.category as any,
        email: values.email || undefined,
      });
      
      onAdd(newStore);
      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        title: t("form.error"),
        description: error.message || t("form.submitFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleReset = () => {
    setIsSubmitted(false);
    form.reset();
  };

  if (isCollapsed) {
    return (
      <div 
        className="bg-white rounded-l-2xl shadow-xl border border-r-0 border-border cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center"
        onClick={onToggleCollapse}
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        <div className="py-6 px-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>{t("form.addLocation")}</span>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-border h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold">{t("form.addLocation")}</h2>
          <div className="flex items-center gap-2">
            {onToggleCollapse && (
              <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8 rounded-full">
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t("form.submittedTitle")}</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            {t("form.submittedMessage")}
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            {t("form.thanks")} 🇺🇦
          </p>
          <Button 
            onClick={handleReset}
            variant="outline"
            className="rounded-lg"
          >
            {t("form.addAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-gray-50">
        <h2 className="text-lg font-bold">{t("form.addLocation")}</h2>
        <div className="flex items-center gap-2">
          {onToggleCollapse && (
            <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8 rounded-full">
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="p-2 bg-white rounded-full shadow-sm mb-1 group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
                <p className="text-xs text-gray-500">{t("form.uploadPhoto")}</p>
                <p className="text-[10px] text-gray-400">{t("form.uploadHint")}</p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>{t("form.storeName")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder={t("form.storeNamePlaceholder")} 
                          {...field} 
                          ref={nameInputRef}
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e.target.value);
                          }}
                          onFocus={() => handleNameChange(field.value)}
                          onBlur={() => setTimeout(() => setShowStoreSuggestions(false), 200)}
                          className="pl-10"
                          data-testid="input-store-name" 
                        />
                      </div>
                    </FormControl>
                    {showStoreSuggestions && storeSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        <div className="p-2 text-xs text-gray-500 border-b bg-yellow-50">
                          {t("form.existingStores") || "Similar stores already on map:"}
                        </div>
                        {storeSuggestions.map((store, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-start gap-2 border-b last:border-b-0"
                            onClick={() => handleStoreSelect(store)}
                          >
                            <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{store.name}</p>
                              <p className="text-xs text-gray-500 truncate">{store.address}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.category")}</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        data-testid="select-store-category"
                      >
                        <option value="food">{t("form.categoryFood")}</option>
                        <option value="clothes">{t("form.categoryClothes")}</option>
                        <option value="other">{t("form.categoryOther")}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.description")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("form.descriptionPlaceholder")} className="resize-none" {...field} data-testid="input-store-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="products"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.products")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("form.productsPlaceholder")} {...field} data-testid="input-store-products" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>{t("form.address")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder={t("form.addressPlaceholder")} 
                          {...field} 
                          ref={addressInputRef}
                          className="pl-10"
                          onChange={(e) => {
                            field.onChange(e);
                            handleAddressChange(e.target.value);
                          }}
                          onFocus={() => {
                            if (addressSuggestions.length > 0) {
                              setShowAddressSuggestions(true);
                            }
                          }}
                          onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                          data-testid="input-store-address" 
                        />
                        {isSearchingAddress && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </FormControl>
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {addressSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-start gap-2 border-b last:border-b-0"
                            onClick={() => handleAddressSelect(suggestion)}
                          >
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <span className="text-sm text-gray-700 line-clamp-2">{suggestion.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.email")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("form.emailPlaceholder")} {...field} data-testid="input-store-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="hidden" aria-hidden="true">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input tabIndex={-1} autoComplete="off" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-black hover:bg-black/80 text-white" disabled={isSubmitting} data-testid="button-store-submit">
                {isSubmitting ? t("form.submitting") : t("form.submitForReview")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
