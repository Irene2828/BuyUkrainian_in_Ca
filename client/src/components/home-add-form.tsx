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
import { CheckCircle, ArrowUpRight, Loader2, X, Image, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const formSectionEyebrowClassName =
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0057B7]/70 font-ui";

const optionalTextField = z.preprocess(
  (value) => typeof value === "string" ? value.trim() : value,
  z.string().optional().default("")
);

const optionalUrlField = z.preprocess(
  (value) => typeof value === "string" ? value.trim() : value,
  z.union([
    z.literal(""),
    z.string().url("Please enter a valid URL (https://...)"),
  ]).default("")
);

const formSchema = z.object({
  city: optionalTextField,
  province: optionalTextField,
  address: z.string().trim().min(5, "Address is required"),
  name: z.string().trim().min(2, "Store name is required"),
  category: z.enum(["food", "clothes", "retail", "other"]),
  website: optionalUrlField,
  products: z
    .string()
    .trim()
    .refine(
      (value) => value.split(",").map((product) => product.trim()).filter(Boolean).length > 0,
      "Please list at least one product"
    ),
  description: optionalTextField,
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  image: z.string().optional(),
});

import { useMapsLibrary } from "@vis.gl/react-google-maps";

export function HomeAddForm({ onClose }: { onClose?: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imagePreviewRef = useRef<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  
  const places = useMapsLibrary("places");

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

  useEffect(() => {
    if (!places || !addressInputRef.current) return;
    
    const autocomplete = new places.Autocomplete(addressInputRef.current, {
      componentRestrictions: { country: "ca" },
      fields: ["geometry", "name", "formatted_address", "address_components"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      let street = "";
      let houseNum = "";
      let city = "";
      let prov = "";

      place.address_components?.forEach((comp: any) => {
        if (comp.types.includes("street_number")) houseNum = comp.short_name;
        if (comp.types.includes("route")) street = comp.short_name;
        if (comp.types.includes("locality")) city = comp.long_name;
        if (comp.types.includes("administrative_area_level_1")) prov = comp.short_name;
      });

      const fullAddress = place.formatted_address || `${houseNum} ${street}, ${city}, ${prov}`;
      
      form.setValue("address", fullAddress, { shouldValidate: true });
      form.setValue("city", city);
      form.setValue("province", prov);
      form.setValue("latitude", lat);
      form.setValue("longitude", lng);

      window.dispatchEvent(new CustomEvent('mapFlyTo', { detail: { lat, lng } }));
    });
  }, [places, form]);

  useEffect(() => {
    return () => {
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }
    };
  }, []);

  const updateImagePreview = (url: string | null) => {
    if (imagePreviewRef.current) {
      URL.revokeObjectURL(imagePreviewRef.current);
    }
    imagePreviewRef.current = url;
    setImagePreview(url);
  };

  async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; city?: string; province?: string } | null> {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(address + ", Canada")}&limit=1`,
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) {
        throw new Error(`Geocoding HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const properties = feature.properties;
        return {
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          city: properties.city || properties.town || properties.village || properties.district || "",
          province: properties.state || "",
        };
      }

      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateImagePreview(url);

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
      <div className="bg-white backdrop-blur-xl rounded-[24px] p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 shadow-2xl ring-1 ring-inset ring-slate-200/50">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-500 fill-none stroke-current" strokeWidth={2} />
        </div>
        <h3 className="text-[24px] font-bold mb-4 font-header text-gray-900">Thanks for helping the map grow</h3>
        <p className="text-slate-500 text-[14px] mb-8 max-w-[280px] font-ui leading-relaxed">
          Your store will appear on the map once verified.
        </p>
        <Button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-[#FFD700] text-slate-950 font-bold text-[16px] tracking-tight antialiased transition-all duration-300 shadow-[0_6px_18px_rgba(255,215,0,0.24)] hover:shadow-[0_10px_24px_rgba(255,215,0,0.32)] hover:bg-[#FFC000] hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 group/submit-btn border-none"
        >
          <span>Back to the map</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto relative z-[2000] bg-white backdrop-blur-xl rounded-[24px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden ring-1 ring-inset ring-slate-200/50 transition-all duration-500 ease-in-out">
      {/* Header */}
      <div className="bg-[#F8F9FA]/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-bold text-[#0057B7] font-header mb-2">
            Add a store
          </h2>
          <p className="text-[13px] text-slate-400 font-medium font-ui ms-0.5">
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              const target = e.target as HTMLElement | null;
              const tagName = target?.tagName;

              // Let Google Places handle Enter on the address field.
              // For the rest of the form, avoid accidental implicit submit.
              if (
                e.key === "Enter" &&
                target !== addressInputRef.current &&
                tagName !== "TEXTAREA" &&
                tagName !== "BUTTON"
              ) {
                e.preventDefault();
              }
            }}
            className="space-y-6"
          >
            <div className="space-y-7">
              <div>
                <span className={formSectionEyebrowClassName}>Required details</span>
              </div>

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
                          placeholder="Type street address to search..."
                          {...field}
                          ref={(el) => {
                            field.ref(el);
                            (addressInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                          }}
                          autoComplete="off"
                          className="h-14 pl-11 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all font-ui text-[15px] text-slate-800 placeholder:text-slate-500"
                        />
                      </div>
                    </FormControl>

                    {/* Location Summary - Shows City/Province automatically */}
                    {(form.watch("city") || form.watch("province")) && (
                      <div className="flex flex-col gap-1 mt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 fill-none stroke-current" strokeWidth={2} />
                          <span className="text-[13px] font-medium text-slate-400 font-ui">
                            {form.watch("city")}, {form.watch("province")}
                          </span>
                        </div>
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
                        className="h-14 px-4 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all font-ui text-[16px] font-normal text-slate-800 placeholder:text-slate-500"
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
                        <select {...field} className="w-full h-14 px-4 rounded-lg border border-slate-200 bg-white text-[16px] font-normal outline-none focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all font-ui appearance-none cursor-pointer text-slate-800">
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

              {/* 4. Products Sold */}
              <FormField
                control={form.control}
                name="products"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-2">Products</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Varenyky, Borscht, Gifts (separate by comma)" {...field} className="h-14 px-4 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all font-ui text-[16px] font-normal text-slate-800 placeholder:text-slate-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <span className={formSectionEyebrowClassName}>Optional details</span>
              </div>
            </div>

            <div className="space-y-7">
              {/* 5. Website (Optional) */}
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
                        className="h-14 px-4 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all font-ui text-[16px] font-normal text-slate-800 placeholder:text-slate-500"
                      />
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
                    <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-2">Brief Store Info (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share what makes this place unique..."
                        {...field}
                        className="min-h-[100px] rounded-lg border border-slate-200 bg-white resize-none font-ui focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all px-5 py-4 text-[16px] font-normal text-slate-800 placeholder:text-slate-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 7. Image Upload Zone */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-3">Store Photo (Optional)</label>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className={cn(
                    "rounded-lg p-8 text-center cursor-pointer transition-all duration-300 group border-2 border-dashed",
                    imagePreview ? "border-green-300 bg-green-50" : "border-slate-300 bg-white hover:border-[#0057B7]/30 hover:bg-[#EFF6FF]/30"
                  )}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updateImagePreview(null); form.setValue("image", ""); }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 fill-none stroke-current" strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Image className="w-8 h-8 text-gray-300 group-hover:text-[#0057B7] transition-colors fill-none stroke-current" strokeWidth={2} />
                      <p className="text-[13px] text-slate-500 font-ui group-hover:text-[#0057B7] transition-colors">Click to upload a photo</p>
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
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-4 mt-8">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center h-[46px] px-6 text-[16px] font-medium tracking-tight rounded-full bg-[#FFD700] text-slate-950 border-none transition-all duration-300 hover:bg-[#FFC000] 2xl:h-[54px] 2xl:text-[16px] shadow-[0_4px_12px_0_rgba(255,215,0,0.18)] hover:shadow-[0_6px_16px_rgba(255,215,0,0.28)] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FFD700]/40 gap-2.5 group/submit-btn"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin fill-none stroke-current" strokeWidth={2} />
                ) : (
                  <><span>Submit Store</span> <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/submit-btn:scale-110 fill-none stroke-current" strokeWidth={2} /></>
                )}
              </Button>

              <div className="flex flex-col gap-3 px-2">
                <p className="text-[13px] text-slate-500 leading-relaxed font-ui text-center">
                  Stores are reviewed before appearing on the map.
                </p>
              </div>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
