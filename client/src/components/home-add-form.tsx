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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStore as apiCreateStore, getApprovedStores } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle, MapPin, Loader2, Store as StoreIcon } from "lucide-react";
import { Store } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

const formSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  products: z.string().min(2, "List at least one product"),
  address: z.string().min(5, "Address is required"),
  description: z.string().min(10, "Description is required"),
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

export function HomeAddForm() {
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [existingStores, setExistingStores] = useState<Store[]>([]);
  const [storeSuggestions, setStoreSuggestions] = useState<Store[]>([]);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getApprovedStores().then((stores: Store[]) => setExistingStores(stores)).catch(() => {});
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      products: "",
      address: "",
      description: "",
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

  const createStoreMutation = useMutation({
    mutationFn: apiCreateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      setIsSubmitted(true);
    },
    onError: () => {
      toast({
        title: t("form.error") || "Error",
        description: t("form.submitFailed") || "Failed to submit location. Please try again.",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.website) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const [latitude, longitude] = await geocodeAddress(values.address);
      await createStoreMutation.mutateAsync({
        name: values.name,
        description: values.description,
        products: values.products.split(",").map(p => p.trim()),
        address: values.address,
        latitude,
        longitude,
        category: values.category as "food" | "clothes" | "other",
        email: values.email || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleReset = () => {
    setIsSubmitted(false);
    form.reset();
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl border border-border p-6 md:p-8 h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">{t("form.submittedTitle") || "Submitted for Review!"}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs">
          {t("form.submittedMessage") || "To prevent spam, your submission will be reviewed by fellow Ukrainian site managers. We'll notify you by email about the status."}
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          {t("form.thanks") || "Thanks for supporting #madeinUkraine"} 🇺🇦
        </p>
        <Button 
          onClick={handleReset}
          variant="outline"
          className="rounded-lg"
        >
          {t("form.addAnother") || "Add Another Location"}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6 md:p-8 h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-2">{t("form.addLocation") || "Add Your Location"}</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {t("form.helperText") || "Help grow our community by sharing Ukrainian stores and products"}
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">{t("form.storeName") || "Business Name"}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder={t("form.storeNamePlaceholder") || "Enter store name"} 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                      onFocus={() => handleNameChange(field.value)}
                      onBlur={() => setTimeout(() => setShowStoreSuggestions(false), 200)}
                      className="rounded-lg h-10 pl-10" 
                      data-testid="input-home-name" 
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
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">{t("form.address") || "Address"}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder={t("form.addressPlaceholder") || "e.g., 123 Main St, Toronto, ON"} 
                      {...field} 
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
                      className="rounded-lg h-10 pl-10" 
                      data-testid="input-home-address" 
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
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">{t("form.category") || "Category"}</FormLabel>
                <FormControl>
                  <select {...field} className="w-full h-10 px-3 rounded-lg border border-input bg-background" data-testid="select-home-category">
                    <option value="food">{t("form.categoryFood") || "Food"}</option>
                    <option value="clothes">{t("form.categoryClothes") || "Clothes"}</option>
                    <option value="other">{t("form.categoryOther") || "Other"}</option>
                  </select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="products"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">{t("form.products") || "Products (comma-separated)"}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.productsPlaceholder") || "e.g., Pysanky, Embroidery, Bread"} {...field} className="rounded-lg h-10" data-testid="input-home-products" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">{t("form.description") || "Description"}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t("form.descriptionPlaceholder") || "Tell us about this location..."} {...field} className="rounded-lg resize-none h-20" data-testid="input-home-description" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">{t("form.email") || "Email"} ({t("form.optional") || "optional"})</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.emailPlaceholder") || "Get notified when approved"} {...field} className="rounded-lg h-10" data-testid="input-home-email" />
                </FormControl>
                <FormMessage className="text-xs" />
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

          <div className="flex-1" />
          
          <Button 
            type="submit" 
            className="w-full h-11 rounded-lg bg-black text-white hover:bg-black/80 font-semibold mt-6"
            disabled={isSubmitting}
            data-testid="button-home-submit"
          >
            {isSubmitting ? t("form.submitting") || "Submitting..." : (
              <>
                {t("form.submitForReview") || "Submit Location"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
