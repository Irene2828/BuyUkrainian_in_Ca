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
import { createStore as apiCreateStore } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle, MapPin, Loader2, X, Upload, Image } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  address: z.string().min(5, "Address is required"),
  name: z.string().min(2, "Store name is required"),
  category: z.enum(["food", "clothes", "retail", "other"]),
  products: z.string().min(2, "List at least one product"),
  description: z.string().min(10, "Description is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
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

export function HomeAddForm({ onClose }: { onClose?: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: "",
      province: "",
      address: "",
      name: "",
      category: "food",
      products: "",
      description: "",
    },
  });

  const [isPinDropMode, setIsPinDropMode] = useState(false);

  const handleAddressChange = (value: string) => {
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
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
    const street = suggestion.address?.road || "";
    const houseNum = suggestion.address?.house_number || "";
    const fullAddress = houseNum ? `${houseNum} ${street}` : street;

    form.setValue("address", fullAddress || suggestion.display_name.split(',')[0]);
    form.setValue("city", suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || "");
    form.setValue("province", suggestion.address?.state || "");

    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    form.setValue("latitude", lat);
    form.setValue("longitude", lng);

    setShowAddressSuggestions(false);

    // Fly to location on map
    // dispatch custom event for map to listen to
    window.dispatchEvent(new CustomEvent('mapFlyTo', { detail: { lat, lng } }));
  };

  // Mock Pin Drop Logic (since we can't easily attach to leaflet from here without context)
  // In a real app we'd use a context or global event bus
  const togglePinDrop = () => {
    setIsPinDropMode(!isPinDropMode);
    toast({
      title: !isPinDropMode ? "Pin Drop Mode Active" : "Pin Drop Mode Cancelled",
      description: !isPinDropMode ? "Click anywhere on the map to set location." : "Return to manual entry.",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const createStoreMutation = useMutation({
    mutationFn: apiCreateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      setIsSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await createStoreMutation.mutateAsync({
        ...values,
        products: values.products.split(",").map(p => p.trim()),
        latitude: values.latitude || 45.4215,
        longitude: values.longitude || -75.6972,
        category: values.category as any,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-[var(--radius-brand)] p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 shadow-2xl border border-blue-50">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold mb-4 font-header text-[var(--color-section-headline)]">Successfully Added!</h3>
        <p className="text-gray-500 text-sm mb-8 max-w-[280px] font-ui">
          Your location has been submitted for review. It will appear on the map once approved by our team.
        </p>
        <Button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-black text-white hover:bg-black/90 font-medium text-[16px] font-ui"
        >
          Back to Map
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white rounded-[var(--radius-brand)] shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-500 ease-in-out",
      isPinDropMode ? "fixed bottom-6 right-6 w-[320px] h-auto z-[2000] scale-90 origin-bottom-right" : "max-w-xl w-full mx-auto relative z-[2000]"
    )}>
      {/* Header */}
      <div className={cn("bg-[#F8F9FA] px-8 py-6 border-b border-gray-100 flex items-center justify-between transition-colors", isPinDropMode && "bg-blue-50")}>
        <div>
          <h3 className="text-[20px] font-bold text-[var(--color-section-headline)] font-header">
            {isPinDropMode ? "Click location on Map" : "Add a New Store"}
          </h3>
          <p className="text-[13px] text-gray-400 font-medium font-ui">
            {isPinDropMode ? "Tap anywhere to set location" : "Help us map Ukrainian businesses"}
          </p>
        </div>
        {onClose && !isPinDropMode && (
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
        {isPinDropMode && (
          <button onClick={togglePinDrop} className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:underline">
            Cancel
          </button>
        )}
      </div>

      <div className="px-8 py-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* 1. City & Province (First - Don Norman logic) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-ui">City</FormLabel>
                    <FormControl>
                      <Input placeholder="Toronto, Vancouver..." {...field} className="h-11 rounded-xl border-gray-100 font-ui focus:border-[#D3E4FD]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-ui">Province</FormLabel>
                    <FormControl>
                      <Input placeholder="Ontario, BC..." {...field} className="h-11 rounded-xl border-gray-100 font-ui focus:border-[#D3E4FD]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 2. Address Autocomplete */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-ui flex justify-between items-center">
                    <span>Street Address</span>
                    <button type="button" onClick={togglePinDrop} className="text-[#3B82F6] hover:text-blue-700 flex items-center gap-1 transition-colors">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Set pin on map</span>
                    </button>
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#3B82F6] transition-colors" />
                      <Input
                        placeholder="Start typing address..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleAddressChange(e.target.value);
                        }}
                        onFocus={() => setShowAddressSuggestions(addressSuggestions.length > 0)}
                        className="h-12 pl-10 rounded-[16px] bg-gray-50 border-transparent focus:bg-white focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all font-ui shadow-sm"
                      />
                      {isSearchingAddress && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#3B82F6]" />}
                    </div>
                  </FormControl>
                  {showAddressSuggestions && (
                    <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {addressSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddressSelect(s)}
                          className="w-full px-4 py-3.5 text-left hover:bg-blue-50 border-b border-gray-50 flex items-center gap-3 transition-colors last:border-0 font-ui group"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                            <MapPin className="w-4 h-4 text-gray-500 group-hover:text-[#3B82F6]" />
                          </div>
                          <span className="text-[14px] text-gray-700 font-medium line-clamp-1">{s.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden Auto-filled Fields if address selected, unless manual edit needed */}
            <div className={cn("grid grid-cols-2 gap-4 transition-all duration-300", form.getValues("city") ? "opacity-50 hover:opacity-100" : "opacity-100")}>
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-gray-400 font-ui">City</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-12 rounded-[16px] bg-gray-50 border-transparent focus:bg-white focus:border-[#3B82F6] font-ui transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-gray-400 font-ui">Province</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-12 rounded-[16px] bg-gray-50 border-transparent focus:bg-white focus:border-[#3B82F6] font-ui transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 3. Business Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-gray-400 font-ui">Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. European Deli & Bakery" {...field} className="h-12 rounded-[16px] bg-gray-50 border-transparent focus:bg-white focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all font-ui shadow-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. Product Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-gray-400 font-ui">Category</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <select {...field} className="w-full h-12 px-4 rounded-[16px] bg-gray-50 border-transparent text-sm outline-none focus:bg-white focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all font-ui appearance-none cursor-pointer">
                        <option value="food">Food & Grocery</option>
                        <option value="clothes">Clothing & Apparel</option>
                        <option value="retail">Retail & Gifts</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 5. Products Sold */}
            <FormField
              control={form.control}
              name="products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-gray-400 font-ui">Products Sold</FormLabel>
                  <p className="text-[11px] text-gray-400 font-normal mb-2 mt-0">List main items separated by commas</p>
                  <FormControl>
                    <Input placeholder="Kyiv Cake, Roshen, Kvass, Pierogi..." {...field} className="h-12 rounded-[16px] bg-gray-50 border-transparent focus:bg-white focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all font-ui shadow-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 6. Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-gray-400 font-ui">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share what makes this place unique..."
                      {...field}
                      className="min-h-[100px] rounded-[16px] bg-gray-50 border-transparent resize-none font-ui focus:bg-white focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10 transition-all shadow-sm p-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 7. Image Upload Zone */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 font-ui block mb-3">Store Photo (Optional)</label>
              <div
                onClick={() => imageInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-[20px] p-8 text-center cursor-pointer transition-all duration-300 group",
                  imagePreview ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-[#3B82F6] hover:bg-blue-50/50"
                )}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Image className="w-8 h-8 text-gray-300" />
                    <p className="text-[13px] text-gray-400 font-ui">Click to upload a photo</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-black text-white hover:bg-black/90 font-medium text-[16px] transition-all flex items-center justify-center gap-2 mt-6 font-ui"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Store <ArrowRight className="w-5 h-5" /></>}
            </Button>

            {/* Privacy Note */}
            <p className="text-[10px] text-gray-400 text-center font-ui">
              No personal data is collected. Submissions are reviewed by volunteers before going live.
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
