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
import { X, Upload, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    
    // Simulate geocoding and submission
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
        status: "pending", // All new submissions are pending
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      onAdd(newStore);
      toast({
        title: "Submitted for Review",
        description: "Your location has been submitted and will appear on the map after admin approval.",
      });
      setIsSubmitting(false);
      onClose();
    }, 1000);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-border h-full flex flex-col overflow-hidden">
      <div 
        className="p-4 border-b border-border flex items-center justify-between bg-gray-50 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h2 className="text-lg font-bold">Add a Location</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onClose(); }} className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="p-6 overflow-y-auto flex-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Photo Upload Mockup */}
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
                    {isSubmitting ? "Submitting..." : "Submit for Review"}
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
