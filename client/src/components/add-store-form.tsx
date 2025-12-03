import { useState } from "react";
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
import { X, Upload, ChevronRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { createStore } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  products: z.string().min(2, "List at least one product"),
  address: z.string().min(5, "Address is required"),
  category: z.enum(["retail", "food", "other"]),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().optional(),
});

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      products: "",
      address: "",
      category: "retail",
      email: "",
      website: "",
    },
  });

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
        title: "Error",
        description: error.message || "Failed to submit store",
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
          <span>Add Location</span>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-border h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold">Add a Location</h2>
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
          <h3 className="text-xl font-bold mb-2">Submitted for Review!</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            To prevent spam, your submission will be reviewed by fellow Ukrainian site managers. We'll notify you by email about the status.
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Thanks for supporting #madeinUkraine 🇺🇦
          </p>
          <Button 
            onClick={handleReset}
            variant="outline"
            className="rounded-lg"
          >
            Add Another Location
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-gray-50">
        <h2 className="text-lg font-bold">Add a Location</h2>
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
              
              <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group">
                <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-gray-500 group-hover:text-blue-500" />
                </div>
                <p className="text-xs font-medium text-gray-500 group-hover:text-blue-600">Click to upload a photo</p>
                <p className="text-[10px] text-gray-400 mt-1">JPG, PNG up to 5MB</p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Kyiv Market" {...field} data-testid="input-store-name" />
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
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        data-testid="select-store-category"
                      >
                        <option value="retail">Retail Store</option>
                        <option value="food">Food & Dining</option>
                        <option value="other">Other</option>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about this place..." className="resize-none" {...field} data-testid="input-store-description" />
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
                    <FormLabel>Products (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Varenyky, Honey, Ceramics" {...field} data-testid="input-store-products" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full street address" {...field} data-testid="input-store-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Get notified when approved" {...field} data-testid="input-store-email" />
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
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
