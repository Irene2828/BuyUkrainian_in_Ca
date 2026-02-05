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
  website: z.string().url("Please enter a valid URL (https://...)").optional().or(z.literal("")),
  products: z.string().min(2, "List at least one product"),
  description: z.string().min(10, "Description is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  image: z.string().optional(),
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
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
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
      website: "",
      products: "",
      description: "",
    },
  });

  const handleAddressChange = (value: string) => {
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    if (value.length >= 3) {
      setIsSearchingAddress(true);
      addressDebounceRef.current = setTimeout(async () => {
        const suggestions = await searchAddresses(value);
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(suggestions.length > 0);
        setActiveIndex(-1); // Reset selection
        setIsSearchingAddress(false);
      }, 300);
    } else {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAddressSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < addressSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleAddressSelect(addressSuggestions[activeIndex]);
    } else if (e.key === "Escape") {
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
    window.dispatchEvent(new CustomEvent('mapFlyTo', { detail: { lat, lng } }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      // Read as base64 and set in form
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        form.setValue("image", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const createStoreMutation = useMutation({
    mutationFn: apiCreateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      setIsSubmitted(true);
      toast({
        title: "Store submitted successfully",
        description: "Thank you for contributing to the community map!",
        variant: "default",
        className: "bg-slate-50 border-l-4 border-slate-900 text-slate-800", // Neutral accent styling
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validate that required geocoding data is present
    if (!values.city || !values.province) {
      toast({
        title: "Missing Location Data",
        description: "Please select an address from the dropdown suggestions to auto-fill city and province.",
        variant: "destructive",
      });
      return;
    }

    if (!values.latitude || !values.longitude) {
      toast({
        title: "Missing Coordinates",
        description: "Please select an address from the dropdown to set the location on the map.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createStoreMutation.mutateAsync({
        ...values,
        products: values.products.split(",").map(p => p.trim()),
        latitude: Number(values.latitude),  // Convert to number for API
        longitude: Number(values.longitude), // Convert to number for API
        category: values.category as any,
        images: values.image ? [values.image] : [], // Wrap in array for 'images' column too
      });
    } catch (error: any) {
      console.error("Submission failed:", error);
      // Detailed error log for the user if they check console
      if (error instanceof Error) {
        console.error("Error Message:", error.message);
      }
      // Error handling is in the mutation's onError
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-[32px] p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 shadow-2xl border border-blue-50">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-500 fill-none stroke-current" strokeWidth={2} />
        </div>
        <h3 className="text-[24px] font-bold mb-4 font-header text-gray-900">Thanks for helping the map grow</h3>
        <p className="text-gray-500 text-[14px] mb-8 max-w-[280px] font-ui leading-relaxed">
          Your store will be reviewed by the community. It will appear on the map once verified.
        </p>
        <Button
          onClick={onClose}
          className="w-full btn-premium-action flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-[1.01]"
        >
          Back to the map
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto relative z-[2000] bg-white/98 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden border border-slate-100 transition-all duration-500 ease-in-out">
      {/* Header */}
      <div className="bg-[#F8F9FA]/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-gray-900 font-header">
            Add a store
          </h2>
          <p className="text-[13px] text-gray-400 font-medium font-ui ms-0.5">
            Help the map grow by adding stores selling Ukrainian-made products
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400 fill-none stroke-current" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="px-8 py-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* 1. Location (Identity First) */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] font-ui block mb-2">
                    Location
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors fill-none stroke-current" strokeWidth={2} />
                      <Input
                        placeholder="Start typing street address..."
                        {...field}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                          field.onChange(e);
                          handleAddressChange(e.target.value);
                        }}
                        onFocus={() => setShowAddressSuggestions(addressSuggestions.length > 0)}
                        className="h-14 pl-11 rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all font-ui shadow-sm text-[15px] placeholder:text-gray-400"
                      />
                      {isSearchingAddress && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-black fill-none stroke-current" strokeWidth={2} />}
                    </div>
                  </FormControl>

                  {/* Location Summary - Shows City/Province automatically */}
                  {(form.getValues("city") || form.getValues("province")) && (
                    <div className="flex items-center gap-2 mt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 fill-none stroke-current" strokeWidth={2} />
                      <span className="text-[13px] font-medium text-slate-400 font-ui">
                        {form.getValues("city")}, {form.getValues("province")}
                      </span>
                    </div>
                  )}

                  {showAddressSuggestions && (
                    <div className="absolute z-[100] w-full mt-2 bg-white/90 backdrop-blur-md border border-[0.5px] border-slate-200/50 rounded-[24px] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {addressSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddressSelect(s)}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={cn(
                            "w-full px-4 py-3.5 text-left border-b border-gray-50/50 flex items-center gap-3 transition-colors last:border-0 font-ui group outline-none",
                            activeIndex === i ? "bg-slate-50" : "hover:bg-slate-50"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                            activeIndex === i ? "bg-slate-200" : "bg-gray-100 group-hover:bg-slate-200"
                          )}>
                            <MapPin className={cn(
                              "w-4 h-4 fill-none stroke-current transition-colors",
                              activeIndex === i ? "text-slate-900" : "text-gray-400 group-hover:text-slate-900"
                            )} strokeWidth={2} />
                          </div>
                          <span className={cn(
                            "text-[14px] font-medium line-clamp-1 transition-colors",
                            activeIndex === i ? "text-black" : "text-gray-700 group-hover:text-black"
                          )}>{s.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Business Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] font-ui block mb-2">Business name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. European Deli & Bakery"
                      {...field}
                      className="h-14 px-4 rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all font-ui shadow-sm text-[15px] font-medium placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Website (Optional) */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] font-ui block mb-2">Website (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      className="h-14 px-4 rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all font-ui shadow-sm text-[15px] cursor-text placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] font-ui block mb-2">Category</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <select {...field} className="w-full h-14 px-4 rounded-full bg-gray-50 border-transparent text-[15px] outline-none focus:bg-white focus:border-black focus:ring-0 transition-all font-ui appearance-none cursor-pointer text-gray-900">
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

            {/* 4. Products Sold (Optional / Supplemental) */}
            <FormField
              control={form.control}
              name="products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] font-ui block mb-2">Products</FormLabel>
                  <FormControl>
                    <Input placeholder="List main items (e.g. Varenyky, Borscht)..." {...field} className="h-14 px-4 rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all font-ui shadow-sm text-[15px] placeholder:text-gray-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 5. Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] font-ui block mb-2">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share what makes this place unique..."
                      {...field}
                      className="min-h-[100px] rounded-[24px] bg-gray-50 border-transparent resize-none font-ui focus:bg-white focus:border-black focus:ring-0 transition-all shadow-sm p-4 text-[15px] placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 6. Image Upload Zone */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] font-ui block mb-3">Store Photo (Optional)</label>
              <div
                onClick={() => imageInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-[20px] p-8 text-center cursor-pointer transition-all duration-300 group",
                  imagePreview ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-black hover:bg-gray-50"
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
                      <X className="w-3 h-3 fill-none stroke-current" strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Image className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors fill-none stroke-current" strokeWidth={2} />
                    <p className="text-[13px] text-gray-400 font-ui group-hover:text-black transition-colors">Click to upload a photo</p>
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
              className="w-full btn-premium-action flex items-center justify-center gap-2 mt-8 shadow-lg hover:shadow-xl hover:scale-[1.01]"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin fill-none stroke-current" strokeWidth={2} /> : <>Add a New Store to the Map <ArrowRight className="w-5 h-5 fill-none stroke-current" strokeWidth={2} /></>}
            </Button>

            {/* Privacy Note */}
            <p className="text-[10px] text-gray-400 text-center font-ui mt-4">
              No personal data is collected. Additions are reviewed by the community.
            </p>

          </form>
        </Form>
      </div>
    </div>
  );
}
