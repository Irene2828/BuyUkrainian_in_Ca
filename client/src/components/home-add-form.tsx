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
import { CheckCircle, ArrowUpRight, Loader2, X, Image, MapPin, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const formSectionEyebrowClassName =
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0057B7] font-ui";

const optionalSectionEyebrowClassName =
  "text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 font-ui";

const formLabelClassName =
  "text-[11px] font-semibold text-slate-700 uppercase tracking-[0.15em] font-ui block mb-2";

const optionalFormLabelClassName =
  "text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] font-ui block mb-2";

const formMessageClassName =
  "text-[12px] font-medium text-red-600/95";

const formInputClassName =
  "h-14 rounded-[12px] border border-slate-200 bg-white font-ui text-[15px] font-medium text-slate-900 placeholder:text-slate-400 shadow-none hover:shadow-none transition-all duration-200 focus:border-[#0057B7]/70 focus:bg-white focus:ring-4 focus:ring-[#0057B7]/10 hover:border-slate-300";

const optionalFormInputClassName =
  "h-14 rounded-[12px] border border-slate-200 bg-slate-50/50 font-ui text-[15px] font-medium text-slate-800 placeholder:text-slate-400 shadow-none hover:shadow-none transition-all duration-200 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/50 hover:border-slate-300";

const PRODUCT_TAXONOMY = {
  "Sweets & snacks": ["Roshen chocolates", "Zefir", "Cookies & Wafers"],
  "Food & Drinks": ["Varenyky / Pierogies", "Borscht / Cabbage rolls", "Salo / Kielbasa", "Kvas / Beverages"],
  "Apparel": ["Vyshyvanka (Embroidered shirt)", "Modern Ukrainian brands"],
  "Gifts & Other": ["Pysanky / Souvenirs", "Cosmetics & Skincare", "Books / Art"]
};

function deriveCategory(products: string[]): "food" | "clothes" | "retail" | "other" {
  const foodKeywords = ["roshen", "zefir", "cookie", "wafer", "varenyky", "pierogi", "borscht", "cabbage", "salo", "kielbasa", "kvas", "beverage", "food", "snack", "drink", "sweet", "meat", "deli", "grocery", "cake", "chocolate", "bread", "cheese", "pancake"];
  const clothesKeywords = ["vyshyvanka", "shirt", "apparel", "clothing", "clothes", "brand"];
  const retailKeywords = ["pysanky", "motanka", "pottery", "souvenir", "cosmetic", "skincare", "makeup", "retail", "gift", "book", "art"];

  let foodScore = 0;
  let clothesScore = 0;
  let retailScore = 0;

  for (const p of products) {
    const lower = p.toLowerCase();
    if (foodKeywords.some(k => lower.includes(k))) foodScore++;
    if (clothesKeywords.some(k => lower.includes(k))) clothesScore++;
    if (retailKeywords.some(k => lower.includes(k))) retailScore++;
  }

  if (foodScore === 0 && clothesScore === 0 && retailScore === 0) return "other";
  
  if (foodScore >= clothesScore && foodScore >= retailScore) return "food";
  if (clothesScore >= retailScore) return "clothes";
  return "retail";
}

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
  website: optionalTextField,
  selectedProducts: z.array(z.string()).default([]),
  otherProducts: optionalTextField,
  description: optionalTextField,
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  company_fax_hp: z.string().optional(),
}).refine(data => data.selectedProducts.length > 0 || data.otherProducts.trim().length > 0, {
  message: "Please select or enter at least one product",
  path: ["otherProducts"]
});

import { useMapsLibrary } from "@vis.gl/react-google-maps";

export function HomeAddForm({ onClose, initialData }: { onClose?: () => void, initialData?: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  
  const places = useMapsLibrary("places");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: initialData?.city || "",
      province: initialData?.province || "",
      address: initialData?.address || "",
      name: initialData?.name || "",
      website: initialData?.website || "",
      selectedProducts: initialData?.products || [],
      otherProducts: "",
      description: initialData?.description || "",
      latitude: initialData?.coordinates?.[0] || undefined,
      longitude: initialData?.coordinates?.[1] || undefined,
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

      const finalProducts = [
        ...values.selectedProducts,
        ...values.otherProducts.split(",").map(p => p.trim()).filter(Boolean)
      ];
      
      const derivedCat = deriveCategory(finalProducts);

      await createStoreMutation.mutateAsync({
        ...values,
        city,
        province,
        description: values.description || "",
        products: finalProducts,
        latitude: String(lat),
        longitude: String(lng),
        category: derivedCat,
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
      <div className="w-full max-w-xl mx-auto overflow-hidden bg-white rounded-[20px] border border-slate-200/80 shadow-[0_16px_40px_-12px_rgba(0,35,85,0.15),0_4px_16px_-4px_rgba(0,0,0,0.08)] p-8 md:p-10">
        <div className="min-h-[420px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 shadow-none">
        <CheckCircle className="w-16 h-16 text-[#0057B7] mb-6 animate-in zoom-in duration-500" strokeWidth={1.5} />
        <h3 className="text-[24px] font-bold mb-4 font-header text-slate-900">Thanks for helping the map grow</h3>
        <p className="text-slate-600 text-[14px] mb-8 max-w-[280px] font-ui leading-relaxed">
          Your store will appear on the map once verified.
        </p>
        <Button
          onClick={onClose}
          className="w-auto px-6 mx-auto h-12 rounded-full bg-white text-slate-700 font-medium text-[16px] tracking-normal antialiased transition-all duration-300 shadow-sm hover:shadow hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group/submit-btn border border-slate-200"
        >
          <span>Back to the map</span>
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto relative z-[2000] bg-white rounded-[20px] border border-slate-200/80 shadow-[0_16px_40px_-12px_rgba(0,35,85,0.15),0_4px_16px_-4px_rgba(0,0,0,0.08)] transition-all duration-500 ease-in-out overflow-hidden max-h-[90vh] pointer-events-auto flex flex-col">
      <div className="flex flex-col shadow-none overflow-y-auto custom-scrollbar h-full w-full">
      {/* Header */}
      <div className="relative shrink-0 overflow-hidden p-4 pb-3 min-[1670px]:p-5 min-[1670px]:pb-4 bg-white border-b border-[#0057B7]/20 sticky top-0 z-20 flex flex-col gap-1.5">
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-b from-[#0057B7]/0 via-[#0057B7]/[0.055] to-[#0057B7]/[0.16]"
        />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <DialogTitle className="text-[17px] xl:text-[18px] min-[1670px]:text-[20px] font-semibold tracking-normal leading-tight antialiased font-header line-clamp-2 text-slate-900">
            {initialData ? "Suggest an edit" : "Add a store"}
          </DialogTitle>
          {onClose && (
            <button
                onClick={onClose}
                className="text-slate-400 hover:text-[#0057B7] hover:bg-[#0057B7]/10 p-1.5 rounded-none transition-colors active:scale-95 shrink-0"
                aria-label="Close"
            >
                <X size={16} />
            </button>
          )}
        </div>
        

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
              {/* HONEYPOT */}
              <FormField
                control={form.control}
                name="company_fax_hp"
                render={({ field }) => (
                  <FormItem className="opacity-0 absolute -z-50 -top-[9999px] -left-[9999px]" aria-hidden="true">
                    <FormControl>
                      <Input tabIndex={-1} autoComplete="off" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
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
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0057B7] transition-colors fill-none stroke-current" strokeWidth={2} />
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
                          <CheckCircle className="w-3.5 h-3.5 text-[#0057B7] fill-none stroke-current" strokeWidth={2} />
                          <span className="text-[13px] font-medium text-slate-600 font-ui">
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
              </div>

              {/* 3. Products Sold */}
              <div className="space-y-4">
                <div className={formLabelClassName}>Products Sold</div>
                <div className="space-y-6">
                  {Object.entries(PRODUCT_TAXONOMY).map(([group, items]) => (
                    <div key={group} className="space-y-2">
                      <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">{group}</div>
                      <div className="flex flex-wrap gap-2">
                        {items.map(item => {
                          const isSelected = form.watch("selectedProducts").includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                const current = form.watch("selectedProducts");
                                if (isSelected) {
                                  form.setValue("selectedProducts", current.filter(p => p !== item), { shouldValidate: true });
                                } else {
                                  form.setValue("selectedProducts", [...current, item], { shouldValidate: true });
                                }
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-full border text-[13px] font-medium transition-colors",
                                isSelected 
                                  ? "bg-[#0057B7] border-[#0057B7] text-white" 
                                  : "bg-white border-slate-200 text-slate-600 hover:border-[#0057B7]/50 hover:bg-slate-50"
                              )}
                            >
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                <FormField
                  control={form.control}
                  name="otherProducts"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel className={optionalFormLabelClassName}>Anything else?</FormLabel>
                      <FormControl>
                        <Input placeholder="List other products, separated by commas" {...field} className={cn(optionalFormInputClassName, "px-4 text-[15px]")} />
                      </FormControl>
                      <FormMessage className={formMessageClassName} />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-10 pb-1">
              <div className="flex items-center gap-3">
                <span className={optionalSectionEyebrowClassName}>Optional details</span>
                <div className="h-px flex-1 bg-slate-200" />
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
                        className={cn(optionalFormInputClassName, "min-h-[104px] resize-none py-4")}
                      />
                    </FormControl>
                    <FormMessage className={formMessageClassName} />
                  </FormItem>
                )}
              />


            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-4 mt-8">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="group/cta-btn relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border-none bg-[#FFD700] hover:bg-[#F2CC00] text-[#0057B7] text-[15px] font-semibold transition-all duration-300 shadow-[0_8px_20px_-8px_rgba(255,215,0,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(255,215,0,0.6)] outline-none whitespace-nowrap z-10 w-full h-[46px] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin fill-none stroke-current" strokeWidth={2.2} />
                ) : (
                  <>
                    <Plus className="h-[18px] w-[18px] text-current stroke-[2.5] transition-transform duration-300 group-hover/cta-btn:rotate-90" />
                    <span>{initialData ? "Submit edit" : "Submit store"}</span>
                  </>
                )}
              </Button>

              <div className="flex flex-col gap-3 px-2">
                <p className="text-[13px] text-slate-500 leading-relaxed font-ui text-center">
                  Stores are reviewed before appearing on the map.
                  <br/>
                  <span className="text-[12px] opacity-80 mt-1 block">Your submission is subject to our <a href="/privacy" target="_blank" className="underline hover:text-blue-500">Privacy Policy</a>.</span>
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
