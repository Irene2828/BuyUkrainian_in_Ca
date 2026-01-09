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
    form.setValue("latitude", parseFloat(suggestion.lat));
    form.setValue("longitude", parseFloat(suggestion.lon));

    setShowAddressSuggestions(false);
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
          className="w-full h-12 rounded-full bg-black text-white hover:bg-black/90 font-bold font-ui"
        >
          Back to Map
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[var(--radius-brand)] shadow-2xl flex flex-col overflow-hidden border border-gray-100 max-w-xl w-full mx-auto">
      {/* Header */}
      <div className="bg-[#F8F9FA] px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-[20px] font-bold text-[var(--color-section-headline)] font-header">Add a New Store</h3>
          <p className="text-[13px] text-gray-400 font-medium font-ui">Help us map Ukrainian businesses</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
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
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-ui">Street Address</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#D3E4FD] transition-colors" />
                      <Input
                        placeholder="123 Main Street..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleAddressChange(e.target.value);
                        }}
                        onFocus={() => setShowAddressSuggestions(addressSuggestions.length > 0)}
                        onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                        className="h-11 pl-10 rounded-xl border-gray-100 font-ui focus:border-[#D3E4FD]"
                      />
                      {isSearchingAddress && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#D3E4FD]" />}
                    </div>
                  </FormControl>
                  {showAddressSuggestions && (
                    <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      {addressSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddressSelect(s)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-50 flex items-start gap-2 transition-colors last:border-0 font-ui"
                        >
                          <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                          <span className="text-sm text-gray-700 line-clamp-2">{s.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Business Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-ui">Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ukrainian Deli, Bakery..." {...field} className="h-11 rounded-xl border-gray-100 font-ui focus:border-[#D3E4FD]" />
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
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-ui">Category</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full h-11 px-4 rounded-xl border border-gray-100 bg-white text-sm outline-none focus:border-[#D3E4FD] transition-all font-ui">
                      <option value="food">Food & Grocery</option>
                      <option value="clothes">Clothing & Apparel</option>
                      <option value="retail">Retail & Gifts</option>
                      <option value="other">Other</option>
                    </select>
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
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-ui">Products Sold</FormLabel>
                  <FormControl>
                    <Input placeholder="Pysanky, Pierogi, Embroidery..." {...field} className="h-11 rounded-xl border-gray-100 font-ui focus:border-[#D3E4FD]" />
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
                  <FormLabel className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-ui">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What makes this place special..."
                      {...field}
                      className="min-h-[80px] rounded-xl border-gray-100 resize-none font-ui focus:border-[#D3E4FD]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 7. Image Upload Zone */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-ui block mb-2">Store Photo (Optional)</label>
              <div
                onClick={() => imageInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                  imagePreview ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-[#D3E4FD] hover:bg-blue-50/30"
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
              className="w-full h-12 rounded-full bg-black text-white hover:bg-black/90 font-bold text-[15px] transition-all flex items-center justify-center gap-2 mt-6"
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
