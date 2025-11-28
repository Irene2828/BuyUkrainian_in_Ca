import { useState } from "react";
import { INITIAL_STORES, Store } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, MapPin, Search, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Stats
  const pendingStores = stores.filter(s => s.status === 'pending');
  const approvedStores = stores.filter(s => s.status === 'approved');
  const rejectedStores = stores.filter(s => s.status === 'rejected');

  const handleApprove = (id: string) => {
    setStores(stores.map(s => s.id === id ? { ...s, status: 'approved' } : s));
    toast({ title: "Store Approved", description: "The location is now live on the map." });
  };

  const handleReject = (id: string) => {
    setStores(stores.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
    toast({ title: "Store Rejected", variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
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
          <Button variant="outline" size="sm" onClick={() => setLocation("/admin/login")}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Cards */}
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

        {/* Main Content */}
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
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved">
            <div className="space-y-4">
               {approvedStores.map(store => (
                  <div key={store.id} className="bg-white p-6 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg">{store.name}</h3>
                      <p className="text-sm text-muted-foreground">{store.address}</p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase">
                      Live
                    </div>
                  </div>
               ))}
            </div>
          </TabsContent>

           <TabsContent value="rejected">
            <div className="space-y-4">
               {rejectedStores.map(store => (
                  <div key={store.id} className="bg-white p-6 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-60">
                    <div>
                      <h3 className="font-bold text-lg">{store.name}</h3>
                      <p className="text-sm text-muted-foreground">{store.address}</p>
                    </div>
                    <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase">
                      Rejected
                    </div>
                  </div>
               ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function SubmissionCard({ store, onApprove, onReject }: { store: Store, onApprove: () => void, onReject: () => void }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Preview */}
        <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
          {store.image ? (
            <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <MapPin className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{store.name}</h3>
              <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium uppercase">
                {store.category}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Submitted: {store.createdAt || 'Today'}</span>
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

        {/* Actions */}
        <div className="flex flex-row md:flex-col gap-2 justify-end shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
          <Button className="bg-green-600 hover:bg-green-700 text-white w-full" onClick={onApprove}>
            <Check className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full" onClick={onReject}>
            <X className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
