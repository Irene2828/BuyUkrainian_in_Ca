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
  city: z.string().optional().default(""),
  province: z.string().optional().default(""),
  address: z.string().min(5, "Address is required"),
  name: z.string().min(2, "Store name is required"),
  category: z.enum(["food", "clothes", "retail", "other"]),
  website: z.string().url("Please enter a valid URL (https://...)").optional().or(z.literal("")),
  products: z.string().min(2, "List at least one product"),
  description: z.string().optional().or(z.literal("")),
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

// Detect Canadian postal code patterns: A1A 1A1, A1A1A1, A1A
const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z]\s?\d?[A-Za-z]?\d?$/;

async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  if (query.length < 2) return [];
  try {
    const trimmed = query.trim();
    const isPostalCode = POSTAL_CODE_REGEX.test(trimmed);

    // For postal codes, use postalcode= structured param for precise results
    if (isPostalCode && trimmed.length >= 3) {
      const postalQuery = trimmed.toUpperCase().replace(/\s/g, '');
      const formatted = postalQuery.length >= 6
        ? `${postalQuery.slice(0, 3)} ${postalQuery.slice(3)}`
        : postalQuery;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(formatted)}&country=Canada&format=json&limit=8&addressdetails=1`,
        { headers: { 'Accept': 'application/json', 'User-Agent': 'BuyUkrainian.ca/1.0' } }
      );
      const results = await response.json();
      if (results.length > 0) return results;
      // Fallback to free-text if structured search returns nothing
    }

    if (trimmed.length < 3) return [];

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&countrycodes=ca&format=json&limit=8&addressdetails=1`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'BuyUkrainian.ca/1.0' } }
    );
    return await response.json();
  } catch (error) {
    console.error("Address search error:", error);
    return [];
  }
}

// Geocode a raw address string to coordinates
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; city?: string; province?: string } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&countrycodes=ca&format=json&limit=1&addressdetails=1`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'BuyUkrainian.ca/1.0' } }
    );
    const results = await response.json();
    if (results.length > 0) {
      const r = results[0];
      return {
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        city: r.address?.city || r.address?.town || r.address?.village || '',
        province: r.address?.state || '',
      };
    }
    return null;
  } catch {
    return null;
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
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

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
    const addr = suggestion.address;
    const street = addr?.road || "";
    const houseNum = addr?.house_number || "";
    const city = addr?.city || addr?.town || addr?.village || "";
    const province = addr?.state || "";
    const postcode = addr?.postcode || "";

    // Build full readable address: 123 Main St, Toronto, ON M5V 2T6
    const streetPart = houseNum ? `${houseNum} ${street}` : street;
    const addressParts = [streetPart, city, province, postcode].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : suggestion.display_name.split(',')[0];

    form.setValue("address", fullAddress);
    form.setValue("city", city);
    form.setValue("province", province);

    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    form.setValue("latitude", lat);
    form.setValue("longitude", lng);

    setShowAddressSuggestions(false);
    setAddressSuggestions([]);

    // Fly to location on map
    window.dispatchEvent(new CustomEvent('mapFlyTo', { detail: { lat, lng } }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      // Compress image before converting to base64
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1200; // Max dimension in pixels
        let { width, height } = img;

        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to JPEG at 70% quality — keeps size well under 4.5MB Vercel limit
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        form.setValue("image", compressed);
      };
      img.src = url;
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
    setIsSubmitting(true);
    try {
      let lat = values.latitude;
      let lng = values.longitude;
      let city = values.city;
      let province = values.province;

      // If coordinates are missing (user typed address manually), try to geocode
      if (!lat || !lng) {
        const geo = await geocodeAddress(values.address);
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
          city = city || geo.city || '';
          province = province || geo.province || '';
        } else {
          // Use approximate center of Canada as fallback — admin will verify
          lat = 56.1304;
          lng = -106.3468;
          city = city || 'Unknown';
          province = province || 'Unknown';
        }
      }

      // Ensure city/province have values
      city = city || 'Unknown';
      province = province || 'Unknown';

      await createStoreMutation.mutateAsync({
        ...values,
        city,
        province,
        description: values.description || "",
        products: values.products.split(",").map(p => p.trim()).filter(Boolean),
        latitude: String(lat),
        longitude: String(lng),
        category: values.category as any,
        images: values.image ? [values.image] : [],
      });
    } catch (error: any) {
      console.error("Submission failed:", error);
      if (error instanceof Error) {
        console.error("Error Message:", error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-slate-50/95 backdrop-blur-xl rounded-[24px] p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 shadow-2xl ring-1 ring-inset ring-slate-200/50">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-500 fill-none stroke-current" strokeWidth={2} />
        </div>
        <h3 className="text-[24px] font-bold mb-4 font-header text-gray-900">Thanks for helping the map grow</h3>
        <p className="text-slate-500 text-[14px] mb-8 max-w-[280px] font-ui leading-relaxed">
          Your store will appear on the map once verified.
        </p>
        <Button
          onClick={onClose}
          className="w-full h-[48px] rounded-[32px] bg-[#0A2540] text-white font-medium text-[16px] tracking-tight antialiased transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(255,232,133,0.2)] hover:bg-[#0F355C] hover:text-[#FFF4CC] hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 group/submit-btn"
        >
          <span>Back to the map</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto relative z-[2000] bg-slate-50/95 backdrop-blur-xl rounded-[24px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden ring-1 ring-inset ring-slate-200/50 transition-all duration-500 ease-in-out">
      {/* Header */}
      <div className="bg-[#F8F9FA]/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-gray-900 font-header mb-2">
            Add a store
          </h2>
          <p className="text-[13px] text-slate-500 font-medium font-ui ms-0.5">
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
                  <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-2">
                    Location
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors fill-none stroke-current" strokeWidth={2} />
                      <Input
                        placeholder="Address or postal code (e.g. M5V 2T6)"
                        {...field}
                        ref={(el) => {
                          field.ref(el);
                          (addressInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                        }}
                        autoComplete="street-address"
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                          field.onChange(e);
                          handleAddressChange(e.target.value);
                        }}
                        onFocus={() => setShowAddressSuggestions(addressSuggestions.length > 0)}
                        onBlur={(e) => {
                          // Only close if focus moves outside the suggestions container
                          const relatedTarget = e.relatedTarget as HTMLElement | null;
                          if (suggestionsRef.current && relatedTarget && suggestionsRef.current.contains(relatedTarget)) return;
                          setTimeout(() => setShowAddressSuggestions(false), 150);
                        }}
                        className="h-14 pl-11 rounded-[16px] bg-white ring-1 ring-inset ring-slate-900/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-transparent focus:bg-white focus:ring-slate-900/20 focus:ring-1 transition-all font-ui text-[15px] text-slate-800 placeholder:text-slate-500"
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
                    <div ref={suggestionsRef} className="absolute z-[100] w-full mt-2 bg-white backdrop-blur-md border border-[0.5px] border-slate-200/50 rounded-[24px] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {addressSuggestions.map((s, i) => {
                        // Build a clean readable address line
                        const addr = s.address;
                        const parts = [
                          addr?.house_number && addr?.road ? `${addr.house_number} ${addr.road}` : addr?.road,
                          addr?.city || addr?.town || addr?.village,
                          addr?.state,
                          addr?.postcode,
                        ].filter(Boolean);
                        const cleanLabel = parts.length > 0 ? parts.join(', ') : s.display_name;

                        return (
                          <button
                            key={i}
                            type="button"
                            tabIndex={0}
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
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className={cn(
                                "text-[14px] font-medium line-clamp-1 transition-colors",
                                activeIndex === i ? "text-black" : "text-gray-700 group-hover:text-black"
                              )}>{cleanLabel}</span>
                              {addr?.postcode && (
                                <span className="text-[11px] text-slate-400 font-ui">{addr.postcode}</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
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
                  <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-2">Business name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. European Deli & Bakery"
                      {...field}
                      autoComplete="off"
                      className="h-14 px-4 rounded-[16px] bg-slate-50 ring-1 ring-inset ring-slate-900/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-transparent focus:bg-white focus:ring-slate-900/20 focus:ring-1 transition-all font-ui text-[16px] font-normal text-slate-800 placeholder:text-slate-500"
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
                  <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-2">Website (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      className="h-14 px-4 rounded-[16px] bg-slate-50 ring-1 ring-inset ring-slate-900/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-transparent focus:bg-white focus:ring-slate-900/20 focus:ring-1 transition-all font-ui text-[16px] font-normal text-slate-800 placeholder:text-slate-500"
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
                  <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-2">Category</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <select {...field} className="w-full h-14 px-4 rounded-[16px] bg-slate-50 ring-1 ring-inset ring-slate-900/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-transparent text-[16px] font-normal outline-none focus:bg-white focus:ring-slate-900/20 focus:ring-1 transition-all font-ui appearance-none cursor-pointer text-slate-800">
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
                  <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-1">Products</FormLabel>
                  <p className="text-[12px] text-slate-500 font-ui mb-2 leading-tight">Type products found in a store separated by comma</p>
                  <FormControl>
                    <Input placeholder="List main items (e.g. Varenyky, Borscht)..." {...field} className="h-14 px-4 rounded-[16px] bg-slate-50 ring-1 ring-inset ring-slate-900/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-transparent focus:bg-white focus:ring-slate-900/20 focus:ring-1 transition-all font-ui text-[16px] font-normal text-slate-800 placeholder:text-slate-500" />
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
                  <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-2">Brief Store Info (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share what makes this place unique..."
                      {...field}
                      className="min-h-[100px] rounded-[16px] bg-slate-50 ring-1 ring-inset ring-slate-900/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border-transparent resize-none font-ui focus:bg-white focus:ring-slate-900/20 focus:ring-1 transition-all px-5 py-4 text-[16px] font-normal text-slate-800 placeholder:text-slate-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 6. Image Upload Zone */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-3">Store Photo (Optional)</label>
              <div
                onClick={() => imageInputRef.current?.click()}
                className={cn(
                  "rounded-[16px] p-8 text-center cursor-pointer transition-all duration-300 group ring-1 ring-inset shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]",
                  imagePreview ? "ring-green-300 bg-green-50" : "ring-slate-900/5 bg-slate-50 hover:ring-slate-900/15"
                )}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImagePreview(null); form.setValue("image", ""); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 fill-none stroke-current" strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Image className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors fill-none stroke-current" strokeWidth={2} />
                    <p className="text-[13px] text-slate-500 font-ui group-hover:text-black transition-colors">Click to upload a photo</p>
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
            <div className="flex flex-col gap-4 mt-8">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[48px] rounded-[32px] bg-[#0A2540] text-white font-medium text-[16px] tracking-tight antialiased transition-all duration-300 shadow-sm hover:shadow-[0_4px_24px_rgba(255,232,133,0.2)] hover:bg-[#0F355C] hover:text-[#FFF4CC] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-navy/20 flex items-center justify-center gap-2 group/submit-btn"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin fill-none stroke-current" strokeWidth={2} />
                ) : (
                  <><span>Submit Store</span> <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/submit-btn:translate-x-1 group-hover/submit-btn:text-[#FFF4CC] fill-none stroke-current" strokeWidth={2} /></>
                )}
              </Button>

              <div className="flex flex-col gap-3 px-2">
                <p className="text-[13px] text-slate-500 leading-relaxed font-ui text-center">
                  All submissions will be approved by admin volunteers to prevent spam or inaccurate listings.{" "}
                  <a href="#faq" onClick={onClose} className="text-slate-900 font-medium underline decoration-slate-300 underline-offset-4 hover:decoration-[#B6FF40] transition-all">
                    Why it matters
                  </a>
                </p>

                <p className="text-[12px] text-slate-500 text-center font-ui">
                  No personal data is collected.
                </p>
              </div>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
