import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Store } from "@/lib/data";
import { getAllStores, updateStoreStatus, deleteStore } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, MapPin, Search, LogOut, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { verifySession, logout, isAuthenticated } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/admin/login");
      return;
    }
    
    verifySession().then((valid) => {
      if (!valid) {
        toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
        setLocation("/admin/login");
      }
    });
  }, [setLocation, toast]);

  const { data: stores = [], isLoading, error } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: getAllStores,
    retry: false,
  });

  useEffect(() => {
    if (error?.message?.includes("Session expired")) {
      setLocation("/admin/login");
    }
  }, [error, setLocation]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) => 
      updateStoreStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({ title: "Store Deleted", description: "The location has been removed from the platform." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete store", variant: "destructive" });
    },
  });

  const pendingStores = stores.filter(s => s.status === 'pending');
  const approvedStores = stores.filter(s => s.status === 'approved');
  const rejectedStores = stores.filter(s => s.status === 'rejected');

  const handleApprove = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: parseInt(id), status: "approved" });
      toast({ title: "Store Approved", description: "The location is now live on the map." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve store", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: parseInt(id), status: "rejected" });
      toast({ title: "Store Rejected", variant: "destructive" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject store", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(parseInt(id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-6 h-6 rounded-full bg-blue-accent flex items-center justify-center overflow-hidden">
            <div className="absolute bottom-0 w-full h-1/2 bg-yellow-accent"></div>
          </div>
          <span className="font-bold text-lg">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">View Live Site</Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              await logout();
              setLocation("/admin/login");
            }}
            data-testid="button-admin-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Review</h3>
            <p className="text-3xl font-bold mt-2 text-orange-600">{pendingStores.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Live Locations</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{approvedStores.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Submissions</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">{stores.length}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-6 bg-white border p-1 h-12 rounded-lg w-full md:w-auto justify-start">
              <TabsTrigger value="pending" className="px-6 py-2 h-10 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                Pending ({pendingStores.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="px-6 py-2 h-10 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                Approved ({approvedStores.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="px-6 py-2 h-10 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                Rejected ({rejectedStores.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingStores.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <p className="text-muted-foreground">No pending submissions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingStores.map(store => (
                    <SubmissionCard 
                      key={store.id} 
                      store={store} 
                      onApprove={() => handleApprove(store.id)} 
                      onReject={() => handleReject(store.id)}
                      onDelete={() => handleDelete(store.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approved">
              {approvedStores.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <p className="text-muted-foreground">No approved stores yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedStores.map(store => (
                    <ApprovedStoreCard 
                      key={store.id} 
                      store={store}
                      onDelete={() => handleDelete(store.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {rejectedStores.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <p className="text-muted-foreground">No rejected submissions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rejectedStores.map(store => (
                    <div key={store.id} className="bg-white p-6 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-60">
                      <div>
                        <h3 className="font-bold text-lg">{store.name}</h3>
                        <p className="text-sm text-muted-foreground">{store.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase">
                          Rejected
                        </span>
                        <DeleteButton onDelete={() => handleDelete(store.id)} storeName={store.name} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function DeleteButton({ onDelete, storeName }: { onDelete: () => void; storeName: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Store</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete "{storeName}"? This action cannot be undone and the store will be removed from the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ApprovedStoreCard({ store, onDelete }: { store: Store; onDelete: () => void }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
          {store.image ? (
            <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div 
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                style={{ background: 'linear-gradient(to bottom, #1E90FF 50%, #FFD700 50%)' }}
              />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{store.name}</h3>
              <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium uppercase">
                {store.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase">
                Live
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{store.description}</p>
          
          <div className="pt-2 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              {store.address}
            </div>
            <div className="flex items-center text-gray-500">
              <Search className="w-4 h-4 mr-1" />
              {store.products.join(", ")}
            </div>
          </div>
        </div>

        <div className="flex items-center shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
          <DeleteButton onDelete={onDelete} storeName={store.name} />
        </div>
      </div>
    </div>
  );
}

function SubmissionCard({ store, onApprove, onReject, onDelete }: { store: Store; onApprove: () => void; onReject: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
          {store.image ? (
            <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <MapPin className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{store.name}</h3>
              <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium uppercase">
                {store.category}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Submitted: {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'Today'}</span>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed">{store.description}</p>
          
          <div className="pt-2 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              {store.address}
            </div>
            <div className="flex items-center text-gray-500">
              <Search className="w-4 h-4 mr-1" />
              {store.products.join(", ")}
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-2 justify-end shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
          <Button className="bg-green-600 hover:bg-green-700 text-white w-full" onClick={onApprove}>
            <Check className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full" onClick={onReject}>
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <DeleteButton onDelete={onDelete} storeName={store.name} />
        </div>
      </div>
    </div>
  );
}
