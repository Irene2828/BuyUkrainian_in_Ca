import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { ArrowRight } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  products: z.string().min(2, "List at least one product"),
  address: z.string().min(5, "Address is required"),
  description: z.string().min(10, "Description is required"),
  category: z.enum(["retail", "food", "services", "other"]),
});

export function HomeAddForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      products: "",
      address: "",
      description: "",
      category: "retail",
    },
  });

  const createStoreMutation = useMutation({
    mutationFn: apiCreateStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({
        title: "Location Submitted!",
        description: "Your location will appear on the map after admin review.",
      });
      form.reset();
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
    setIsSubmitting(true);
    try {
      await createStoreMutation.mutateAsync({
        name: values.name,
        description: values.description,
        products: values.products.split(",").map(p => p.trim()),
        address: values.address,
        latitude: 43.6532 + (Math.random() - 0.5) * 0.1,
        longitude: -79.3832 + (Math.random() - 0.5) * 0.1,
        category: values.category,
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  <Input placeholder="Enter store name" {...field} className="rounded-lg h-10" />
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
                  <Input placeholder="e.g., 123 Main St, Toronto, ON" {...field} className="rounded-lg h-10" />
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
                  <select {...field} className="w-full h-10 px-3 rounded-lg border border-input bg-background">
                    <option value="retail">Retail Store</option>
                    <option value="food">Food & Cafe</option>
                    <option value="services">Services</option>
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
                  <Input placeholder="e.g., Pysanky, Embroidery, Bread" {...field} className="rounded-lg h-10" />
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
                  <Textarea placeholder="Tell us about this location..." {...field} className="rounded-lg resize-none h-20" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex-1" />
          
          <Button 
            type="submit" 
            className="w-full h-11 rounded-lg bg-black text-white hover:bg-black/80 font-semibold mt-6"
            disabled={isSubmitting}
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
