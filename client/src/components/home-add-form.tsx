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
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStore as apiCreateStore } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowUpRight, Loader2, X, Image, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formSectionEyebrowClassName =
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FFD700] font-ui";

const optionalSectionEyebrowClassName =
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 font-ui";

const formLabelClassName =
  "text-[11px] font-semibold text-white/95 uppercase tracking-[0.15em] font-ui block mb-2";

const optionalFormLabelClassName =
  "text-[11px] font-semibold text-white/78 uppercase tracking-[0.15em] font-ui block mb-2";

const formMessageClassName =
  "text-[12px] font-medium text-[#FFD700]/95";

const formInputClassName =
  "h-14 rounded-none border border-white/25 bg-white/[0.10] font-ui text-[15px] font-medium text-white placeholder:text-white/55 shadow-none transition-all duration-200 focus:border-[#FFD700]/70 focus:bg-white/[0.16] focus:ring-2 focus:ring-[#FFD700]/15";

const optionalFormInputClassName =
  "h-14 rounded-none border border-white/20 bg-white/[0.065] font-ui text-[15px] font-medium text-white/90 placeholder:text-white/40 shadow-none transition-all duration-200 focus:border-white/45 focus:bg-white/[0.11] focus:ring-2 focus:ring-white/10";

const categoryOptions = [
  { value: "food", label: "Food & Grocery" },
  { value: "clothes", label: "Clothing & Apparel" },
  { value: "retail", label: "Retail & Gifts" },
  { value: "other", label: "Other" },
] as const;

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
  website: optionalTextField,
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
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
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
      <div className="w-full max-w-xl mx-auto overflow-hidden bg-[#0057B7] bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,rgba(0,87,183,0.96)_42%,rgba(0,87,183,1)_100%)] rounded-none border border-white/25 p-8 md:p-10">
        <div className="min-h-[420px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 shadow-none">
        <CheckCircle className="w-16 h-16 text-[#FFD700] mb-6 animate-in zoom-in duration-500" strokeWidth={1.5} />
        <h3 className="text-[24px] font-bold mb-4 font-header text-white">Thanks for helping the map grow</h3>
        <p className="text-white/70 text-[14px] mb-8 max-w-[280px] font-ui leading-relaxed">
          Your store will appear on the map once verified.
        </p>
        <Button
          onClick={onClose}
          className="w-auto px-6 mx-auto h-12 rounded-none bg-transparent text-white font-medium text-[16px] tracking-normal antialiased transition-all duration-300 shadow-none hover:shadow-none hover:bg-white/10 hover:border-[#FFD700] hover:text-white hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group/submit-btn border border-white/35"
        >
          <span>Back to the map</span>
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto relative z-[2000] bg-[#0057B7] bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,rgba(0,87,183,0.96)_42%,rgba(0,87,183,1)_100%)] rounded-none border border-white/25 shadow-[0_24px_80px_rgba(0,45,112,0.35)] transition-all duration-500 ease-in-out overflow-y-auto max-h-[90vh] custom-scrollbar">
      <div className="flex flex-col shadow-none">
      {/* Header */}
      <div className="relative overflow-hidden px-6 py-6 md:px-8 border-b border-white/15 flex items-center justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-white/0 via-white/[0.035] to-white/[0.08]"
        />
        <div className="relative z-10">
          <DialogTitle className="text-[20px] xl:text-[21px] min-[1670px]:text-[23px] font-semibold tracking-tight leading-tight antialiased font-header text-white mb-2">
            Add a store
          </DialogTitle>
          <DialogDescription className="text-[13px] text-white/65 font-medium font-ui ms-0.5">
            Help the map grow by adding stores selling Ukrainian-made products
          </DialogDescription>
        </div>
        {onClose && (
          <button onClick={onClose} className="relative z-10 p-2 text-white/65 hover:text-white hover:bg-white/10 rounded-none transition-colors">
            <X className="w-5 h-5 fill-none stroke-current" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="px-6 py-6 md:px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              const firstError = Object.values(errors)[0];
              toast({
                title: "Please check your inputs",
                description: firstError?.message as string || "Some fields require your attention.",
                variant: "destructive",
              });
            })}
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
                    <FormLabel className={formLabelClassName}>
                      Location
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 group-focus-within:text-white/85 transition-colors fill-none stroke-current" strokeWidth={2} />
                        <Input
                          placeholder="Search street address"
                          {...field}
                          ref={(el) => {
                            field.ref(el);
                            (addressInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                          }}
                          autoComplete="off"
                          className={cn(formInputClassName, "pl-11")}
                        />
                      </div>
                    </FormControl>

                    {/* Location Summary - Shows City/Province automatically */}
                    {(form.watch("city") || form.watch("province")) && (
                      <div className="flex flex-col gap-1 mt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-[#FFD700] fill-none stroke-current" strokeWidth={2} />
                          <span className="text-[13px] font-medium text-white/70 font-ui">
                            {form.watch("city")}, {form.watch("province")}
                          </span>
                        </div>
                      </div>
                    )}
                    <FormMessage className={formMessageClassName} />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2. Business Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={formLabelClassName}>Business name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="European Deli"
                          {...field}
                          autoComplete="off"
                          className={cn(formInputClassName, "px-4 text-[16px]")}
                        />
                      </FormControl>
                      <FormMessage className={formMessageClassName} />
                    </FormItem>
                  )}
                />

                {/* 3. Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => {
                    const selectedCategory =
                      categoryOptions.find((option) => option.value === field.value) ?? categoryOptions[0];

                    return (
                      <FormItem>
                        <FormLabel className={formLabelClassName}>Category</FormLabel>
                        <FormControl>
                          <div
                            className="relative"
                            onBlur={(event) => {
                              const nextFocus = event.relatedTarget;
                              if (!(nextFocus instanceof Node) || !event.currentTarget.contains(nextFocus)) {
                                field.onBlur();
                                setIsCategoryMenuOpen(false);
                              }
                            }}
                          >
                            <button
                              ref={field.ref}
                              type="button"
                              name={field.name}
                              aria-haspopup="listbox"
                              aria-expanded={isCategoryMenuOpen}
                              onClick={() => setIsCategoryMenuOpen((open) => !open)}
                              className={cn(
                                formInputClassName,
                                "flex w-full items-center justify-between px-4 pr-11 text-left text-[16px]"
                              )}
                            >
                              <span>{selectedCategory.label}</span>
                              <ChevronDown
                                className={cn(
                                  "absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FFD700] transition-transform",
                                  isCategoryMenuOpen && "rotate-180"
                                )}
                                strokeWidth={2.5}
                              />
                            </button>

                            {isCategoryMenuOpen && (
                              <div
                                role="listbox"
                                className="absolute left-0 right-0 top-[calc(100%+6px)] z-[2200] overflow-hidden border border-white/25 bg-[#0057B7]/95 shadow-[0_18px_38px_rgba(0,40,100,0.28)] backdrop-blur-xl"
                              >
                                {categoryOptions.map((option) => {
                                  const isSelected = option.value === field.value;

                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      role="option"
                                      aria-selected={isSelected}
                                      onClick={() => {
                                        field.onChange(option.value);
                                        setIsCategoryMenuOpen(false);
                                      }}
                                      className={cn(
                                        "flex w-full items-center justify-between px-4 py-3 text-left text-[14px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white",
                                        isSelected && "bg-white/[0.13] text-white"
                                      )}
                                    >
                                      <span>{option.label}</span>
                                      {isSelected && <span className="h-1.5 w-1.5 bg-[#FFD700]" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                        </FormControl>
                        <FormMessage className={formMessageClassName} />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* 4. Products Sold */}
              <FormField
                control={form.control}
                name="products"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={formLabelClassName}>Products</FormLabel>
                    <FormControl>
                      <Input placeholder="Varenyky, borscht, gifts" {...field} className={cn(formInputClassName, "px-4 text-[16px]")} />
                    </FormControl>
                    <FormMessage className={formMessageClassName} />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-10 pb-1">
              <div className="flex items-center gap-3">
                <span className={optionalSectionEyebrowClassName}>Optional details</span>
                <div className="h-px flex-1 bg-white/12" />
              </div>
            </div>

            <div className="space-y-7">
              {/* 5. Website (Optional) */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={optionalFormLabelClassName}>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                        className={cn(optionalFormInputClassName, "px-4 text-[16px]")}
                      />
                    </FormControl>
                    <FormMessage className={formMessageClassName} />
                  </FormItem>
                )}
              />

              {/* 6. Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={optionalFormLabelClassName}>Brief Store Info (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share what makes this place unique..."
                        {...field}
                        className="min-h-[104px] rounded-none border border-white/20 bg-white/[0.065] resize-none font-ui focus:border-white/45 focus:bg-white/[0.11] focus:ring-2 focus:ring-white/10 transition-all duration-200 px-4 py-4 text-[16px] font-medium text-white/90 placeholder:text-white/40"
                      />
                    </FormControl>
                    <FormMessage className={formMessageClassName} />
                  </FormItem>
                )}
              />

              {/* 7. Image Upload Zone */}
              <div>
                <label className={cn(optionalFormLabelClassName, "mb-3")}>Store Photo (Optional)</label>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className={cn(
                    "rounded-none p-8 text-center cursor-pointer transition-all duration-300 group border border-dashed",
                    imagePreview ? "border-white/45 bg-white/[0.11]" : "border-white/20 bg-white/[0.055] hover:border-white/40 hover:bg-white/[0.10]"
                  )}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-none border border-white/20" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updateImagePreview(null); form.setValue("image", ""); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-[#0057B7] text-white border border-white/40 rounded-none flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <X className="w-3 h-3 fill-none stroke-current" strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Image className="w-8 h-8 text-white/45 group-hover:text-[#FFD700] transition-colors fill-none stroke-current" strokeWidth={2} />
                      <p className="text-[13px] text-white/65 font-ui group-hover:text-white transition-colors">Click to upload a photo</p>
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
                className="group/submit-btn relative inline-flex w-full items-center justify-center h-[46px] 2xl:h-[54px] px-6 text-[16px] 2xl:text-[17px] font-semibold tracking-normal rounded-none bg-white/90 hover:bg-white text-[#0057B7] border-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-none hover:shadow-none focus:shadow-none focus:outline-none focus:ring-2 focus:ring-white/30 font-sans antialiased gap-2.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin fill-none stroke-current" strokeWidth={2} />
                ) : (
                  <><span>Submit a Store</span> <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/submit-btn:scale-110 fill-none stroke-current" strokeWidth={2} /></>
                )}
              </Button>

              <div className="flex flex-col gap-3 px-2">
                <p className="text-[13px] text-white/60 leading-relaxed font-ui text-center">
                  Stores are reviewed before appearing on the map.
                </p>
              </div>
            </div>

          </form>
        </Form>
      </div>
      </div>
    </div>
  );
}
