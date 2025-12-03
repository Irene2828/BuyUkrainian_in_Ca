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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStore as apiCreateStore } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  products: z.string().min(2, "List at least one product"),
  address: z.string().min(5, "Address is required"),
  description: z.string().min(10, "Description is required"),
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

export function HomeAddForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      products: "",
      address: "",
      description: "",
      category: "retail",
      email: "",
      website: "",
    },
  });

  const createStoreMutation = useMutation({
    mutationFn: apiCreateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      setIsSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit location. Please try again.",
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
        category: values.category,
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
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6 md:p-8 h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-2">Add Your Location</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Help grow our community by sharing Ukrainian stores and products
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter store name" {...field} className="rounded-lg h-10" data-testid="input-home-name" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Address</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 123 Main St, Toronto, ON" {...field} className="rounded-lg h-10" data-testid="input-home-address" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Category</FormLabel>
                <FormControl>
                  <select {...field} className="w-full h-10 px-3 rounded-lg border border-input bg-background" data-testid="select-home-category">
                    <option value="retail">Retail Store</option>
                    <option value="food">Food & Cafe</option>
                    <option value="other">Other</option>
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
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Products (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Pysanky, Embroidery, Bread" {...field} className="rounded-lg h-10" data-testid="input-home-products" />
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
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Tell us about this location..." {...field} className="rounded-lg resize-none h-20" data-testid="input-home-description" />
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
                <FormLabel className="text-xs uppercase font-semibold text-muted-foreground">Email (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Get notified when approved" {...field} className="rounded-lg h-10" data-testid="input-home-email" />
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
            {isSubmitting ? "Submitting..." : (
              <>
                Submit Location
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
