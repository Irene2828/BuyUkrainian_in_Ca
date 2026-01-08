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
import { DialogClose } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStore as apiCreateStore } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle, MapPin, Loader2, Store as StoreIcon, X, Plus, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  products: z.string().min(2, "List at least one product"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  description: z.string().min(10, "Description is required"),
  category: z.enum(["food", "clothes", "retail", "other"]),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
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
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const addressDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      products: "",
      address: "",
      city: "",
      province: "",
      description: "",
      category: "food",
      email: "",
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
        latitude: values.latitude || 45.4215, // Default Ottawa if not found
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
        <h3 className="text-2xl font-bold mb-4 font-sans text-[var(--color-section-headline)]">Successfully Added!</h3>
        <p className="text-gray-500 text-sm mb-8 max-w-[280px] font-sans">
          Your location has been submitted for review. It will appear on the map once approved by our team.
        </p>
        <Button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-black text-white hover:bg-black/90 font-bold font-sans"
        >
          Back to Map
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[var(--radius-brand)] shadow-2xl flex flex-col overflow-hidden border border-gray-100 max-w-xl w-full mx-auto">
      {/* Header */}
      <div className="bg-[#F8F9FA] px-10 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-[20px] font-bold text-[var(--color-section-headline)] font-sans">Add a New Store</h3>
          <p className="text-[13px] text-gray-400 font-medium font-ui">Add a business to our Ukrainian map</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <div className="px-10 py-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-wider font-ui">Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="European Deli..." {...field} className="h-12 rounded-[var(--radius-brand)] border-gray-100 font-sans focus:border-[#D3E4FD] transition-all font-ui" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-wider font-ui">Category</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full h-12 px-4 rounded-[var(--radius-brand)] border border-gray-100 bg-white font-sans text-sm outline-none focus:border-[#D3E4FD] transition-all font-ui">
                        <option value="food">Food</option>
                        <option value="clothes">Clothing</option>
                        <option value="retail">Retail</option>
                        <option value="other">Gifts/Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-wider font-ui">Address Autocomplete</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#D3E4FD] transition-colors" />
                      <Input
                        placeholder="Start typing your Canadian address..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleAddressChange(e.target.value);
                        }}
                        onFocus={() => setShowAddressSuggestions(addressSuggestions.length > 0)}
                        onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                        className="h-12 pl-12 rounded-[var(--radius-brand)] border-gray-100 font-sans focus:border-[#D3E4FD] transition-all font-ui"
                      />
                      {isSearchingAddress && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#D3E4FD]" />}
                    </div>
                  </FormControl>
                  {showAddressSuggestions && (
                    <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-[var(--radius-brand)] shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                      {addressSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddressSelect(s)}
                          className="w-full px-5 py-4 text-left hover:bg-blue-50 border-b border-gray-50 flex items-start gap-3 transition-colors last:border-0 font-ui"
                        >
                          <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                          <span className="text-sm text-black font-medium line-clamp-2">{s.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-wider font-ui">City</FormLabel>
                    <FormControl>
                      <Input placeholder="Auto-filled" {...field} className="h-12 rounded-[var(--radius-brand)] border-gray-100 font-sans font-ui focus:border-[#D3E4FD]" />
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
                    <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-wider font-ui">Province</FormLabel>
                    <FormControl>
                      <Input placeholder="Auto-filled" {...field} className="h-12 rounded-[var(--radius-brand)] border-gray-100 font-sans font-ui focus:border-[#D3E4FD]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="products"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-wider font-ui">Products Sold</FormLabel>
                  <FormControl>
                    <Input placeholder="Pysanky, Embroidery, Pierogi..." {...field} className="h-12 rounded-[var(--radius-brand)] border-gray-100 font-sans font-ui focus:border-[#D3E4FD]" />
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
                  <FormLabel className="text-[12px] font-bold text-gray-400 uppercase tracking-wider font-ui">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us what makes this place special..."
                      {...field}
                      className="min-h-[100px] rounded-[var(--radius-brand)] border-gray-100 font-sans resize-none font-ui focus:border-[#D3E4FD]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-black text-white hover:bg-black/90 font-bold text-[16px] transition-all flex items-center justify-center gap-3 mt-4"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit store <ArrowRight className="w-5 h-5" /></>}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
