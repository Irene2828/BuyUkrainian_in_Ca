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
import { Store } from "@/lib/data";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  products: z.string().min(2, "List at least one product"),
  address: z.string().min(5, "Address is required"),
  category: z.enum(["retail", "food", "services", "other"]),
});

interface AddStoreFormProps {
  onAdd: (store: Store) => void;
  onClose: () => void;
}

export function AddStoreForm({ onAdd, onClose }: AddStoreFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      products: "",
      address: "",
      category: "retail",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Simulate geocoding (random nearby point for mockup)
    // In real app, would use Geocoding API
    setTimeout(() => {
      const newStore: Store = {
        id: Math.random().toString(36).substr(2, 9),
        name: values.name,
        description: values.description,
        products: values.products.split(",").map(p => p.trim()),
        address: values.address,
        coordinates: [
          43.6532 + (Math.random() - 0.5) * 0.1, 
          -79.3832 + (Math.random() - 0.5) * 0.1
        ], // Random Toronto-ish coords
        category: values.category as any,
      };
      
      onAdd(newStore);
      toast({
        title: "Store Added!",
        description: "Thank you for contributing to the community map.",
      });
      setIsSubmitting(false);
      onClose();
    }, 1000);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border h-full flex flex-col">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold">Add a Location</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-6 overflow-y-auto flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Kyiv Market" {...field} />
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
                    >
                      <option value="retail">Retail Store</option>
                      <option value="food">Food & Dining</option>
                      <option value="services">Services</option>
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
                    <Textarea placeholder="Tell us about this place..." className="resize-none" {...field} />
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
                    <Input placeholder="e.g. Varenyky, Honey, Ceramics" {...field} />
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
                    <Input placeholder="Full street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-black hover:bg-black/80 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Location"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
