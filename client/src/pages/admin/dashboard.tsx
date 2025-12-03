import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Store } from "@/lib/data";
import { getAllStores, updateStoreStatus, deleteStore, updateStoreImage, getAdminUsers, createAdminUser, updateAdminPassword, deleteAdminUser, AdminUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, MapPin, Search, LogOut, Trash2, Image, Users, Plus, Key, Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { verifySession, logout, isAuthenticated } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { t } = useI18n();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation("/admin/login");
      return;
    }
    
    verifySession().then((valid) => {
      if (!valid) {
        toast({ title: t("admin.dashboard.sessionExpired"), description: t("admin.dashboard.pleaseLogin"), variant: "destructive" });
        setLocation("/admin/login");
      }
    });
  }, [setLocation, toast, t]);

  const { data: stores = [], isLoading, error } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: getAllStores,
    retry: false,
  });

  const { data: adminUsers = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
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

  const updateImageMutation = useMutation({
    mutationFn: ({ id, image }: { id: number; image: string | null }) => 
      updateStoreImage(id, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({ title: "Image Updated", description: "Store image has been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: t("toast.error"), description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast({ title: t("admin.dashboard.storeDeleted"), description: t("admin.dashboard.storeDeletedDesc") });
    },
    onError: () => {
      toast({ title: t("toast.error"), description: t("form.submitFailed"), variant: "destructive" });
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => 
      createAdminUser(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Admin Created", description: "New admin user has been created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: t("toast.error"), description: error.message, variant: "destructive" });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) => 
      updateAdminPassword(id, newPassword),
    onSuccess: () => {
      toast({ title: "Password Updated", description: "Password has been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: t("toast.error"), description: error.message, variant: "destructive" });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: number) => deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Admin Deleted", description: "Admin user has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: t("toast.error"), description: error.message, variant: "destructive" });
    },
  });

  const pendingStores = stores.filter(s => s.status === 'pending');
  const approvedStores = stores.filter(s => s.status === 'approved');
  const rejectedStores = stores.filter(s => s.status === 'rejected');

  const handleApprove = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: parseInt(id), status: "approved" });
      toast({ title: t("admin.dashboard.storeApproved"), description: t("admin.dashboard.storeApprovedDesc") });
    } catch (error) {
      toast({ title: t("toast.error"), description: t("form.submitFailed"), variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: parseInt(id), status: "rejected" });
      toast({ title: t("admin.dashboard.storeRejected"), variant: "destructive" });
    } catch (error) {
      toast({ title: t("toast.error"), description: t("form.submitFailed"), variant: "destructive" });
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
          <span className="font-bold text-lg">{t("admin.dashboard.title")}</span>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            data-testid="button-manage-admins"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Admins
          </Button>
          <Link href="/">
            <Button variant="ghost" size="sm">{t("admin.dashboard.viewLive")}</Button>
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
            {t("admin.dashboard.logout")}
          </Button>
        </div>
      </header>

      {showAdminPanel && (
        <AdminManagementPanel 
          adminUsers={adminUsers}
          onCreateAdmin={(username, password) => createAdminMutation.mutate({ username, password })}
          onUpdatePassword={(id, newPassword) => updatePasswordMutation.mutate({ id, newPassword })}
          onDeleteAdmin={(id) => deleteAdminMutation.mutate(id)}
          isCreating={createAdminMutation.isPending}
          t={t}
        />
      )}

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("admin.dashboard.pendingReview")}</h3>
            <p className="text-3xl font-bold mt-2 text-orange-600">{pendingStores.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("admin.dashboard.liveLocations")}</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">{approvedStores.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("admin.dashboard.totalSubmissions")}</h3>
            <p className="text-3xl font-bold mt-2 text-gray-900">{stores.length}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <p className="text-muted-foreground">{t("admin.dashboard.loading")}</p>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-6 bg-white border p-1 h-12 rounded-lg w-full md:w-auto justify-start">
              <TabsTrigger value="pending" className="px-6 py-2 h-10 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                {t("admin.dashboard.pending")} ({pendingStores.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="px-6 py-2 h-10 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                {t("admin.dashboard.approved")} ({approvedStores.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="px-6 py-2 h-10 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                {t("admin.dashboard.rejected")} ({rejectedStores.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingStores.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <p className="text-muted-foreground">{t("admin.dashboard.noPending")}</p>
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
                      t={t}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approved">
              {approvedStores.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <p className="text-muted-foreground">{t("admin.dashboard.noApproved")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedStores.map(store => (
                    <ApprovedStoreCard 
                      key={store.id} 
                      store={store}
                      onDelete={() => handleDelete(store.id)}
                      onUpdateImage={(image) => updateImageMutation.mutate({ id: parseInt(store.id), image })}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {rejectedStores.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <p className="text-muted-foreground">{t("admin.dashboard.noRejected")}</p>
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
                          {t("admin.dashboard.rejected")}
                        </span>
                        <DeleteButton onDelete={() => handleDelete(store.id)} storeName={store.name} t={t} />
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

function DeleteButton({ onDelete, storeName, t }: { onDelete: () => void; storeName: string; t: (key: string) => string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("admin.dashboard.deleteStore")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("admin.dashboard.deleteConfirm").replace("{name}", storeName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("admin.dashboard.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
            {t("admin.dashboard.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ApprovedStoreCard({ store, onDelete, onUpdateImage, t }: { store: Store; onDelete: () => void; onUpdateImage: (image: string | null) => void; t: (key: string) => string }) {
  const [imageUrl, setImageUrl] = useState(store.image || "");
  const [isEditingImage, setIsEditingImage] = useState(false);

  const handleSaveImage = () => {
    onUpdateImage(imageUrl.trim() || null);
    setIsEditingImage(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative group">
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
          <Dialog open={isEditingImage} onOpenChange={setIsEditingImage}>
            <DialogTrigger asChild>
              <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Image className="w-6 h-6" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Store Image</DialogTitle>
                <DialogDescription>Enter an image URL for this store listing.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-store-image-url"
                  />
                </div>
                {imageUrl && (
                  <div className="border rounded-lg overflow-hidden">
                    <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditingImage(false)}>Cancel</Button>
                <Button onClick={handleSaveImage} data-testid="button-save-image">Save Image</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                {t("admin.dashboard.live")}
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
          <DeleteButton onDelete={onDelete} storeName={store.name} t={t} />
        </div>
      </div>
    </div>
  );
}

function SubmissionCard({ store, onApprove, onReject, onDelete, t }: { store: Store; onApprove: () => void; onReject: () => void; onDelete: () => void; t: (key: string) => string }) {
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
            <span className="text-xs text-muted-foreground">{t("admin.dashboard.submitted")} {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : t("admin.dashboard.today")}</span>
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
            {t("admin.dashboard.approve")}
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full" onClick={onReject}>
            <X className="w-4 h-4 mr-2" />
            {t("admin.dashboard.reject")}
          </Button>
          <DeleteButton onDelete={onDelete} storeName={store.name} t={t} />
        </div>
      </div>
    </div>
  );
}

function AdminManagementPanel({ 
  adminUsers, 
  onCreateAdmin, 
  onUpdatePassword, 
  onDeleteAdmin,
  isCreating,
  t 
}: { 
  adminUsers: AdminUser[];
  onCreateAdmin: (username: string, password: string) => void;
  onUpdatePassword: (id: number, newPassword: string) => void;
  onDeleteAdmin: (id: number) => void;
  isCreating: boolean;
  t: (key: string) => string;
}) {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePasswordId, setChangePasswordId] = useState<number | null>(null);
  const [changedPassword, setChangedPassword] = useState("");
  const [showChangedPassword, setShowChangedPassword] = useState(false);

  const handleCreateAdmin = () => {
    if (newUsername.length >= 3 && newPassword.length >= 8) {
      onCreateAdmin(newUsername, newPassword);
      setNewUsername("");
      setNewPassword("");
    }
  };

  const handleChangePassword = (id: number) => {
    if (changedPassword.length >= 8) {
      onUpdatePassword(id, changedPassword);
      setChangePasswordId(null);
      setChangedPassword("");
    }
  };

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-6 py-6">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Admin User Management
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New Admin */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Admin
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="newUsername">Username</Label>
                <Input
                  id="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username (min 3 chars)"
                  data-testid="input-new-admin-username"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password (min 8 chars)"
                    data-testid="input-new-admin-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button 
                onClick={handleCreateAdmin} 
                disabled={newUsername.length < 3 || newPassword.length < 8 || isCreating}
                className="w-full"
                data-testid="button-create-admin"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Admin
              </Button>
            </div>
          </div>

          {/* Existing Admins */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-3">Existing Admins</h3>
            {adminUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No database admins yet. You can still log in using the environment variable password.</p>
            ) : (
              <div className="space-y-2">
                {adminUsers.map(admin => (
                  <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{admin.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog open={changePasswordId === admin.id} onOpenChange={(open) => !open && setChangePasswordId(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setChangePasswordId(admin.id)}>
                            <Key className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>Enter a new password for {admin.username}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="changedPassword">New Password</Label>
                              <div className="relative">
                                <Input
                                  id="changedPassword"
                                  type={showChangedPassword ? "text" : "password"}
                                  value={changedPassword}
                                  onChange={(e) => setChangedPassword(e.target.value)}
                                  placeholder="Enter new password (min 8 chars)"
                                  data-testid="input-change-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowChangedPassword(!showChangedPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                  {showChangedPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setChangePasswordId(null)}>Cancel</Button>
                            <Button 
                              onClick={() => handleChangePassword(admin.id)}
                              disabled={changedPassword.length < 8}
                              data-testid="button-confirm-change-password"
                            >
                              Update Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {admin.username}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteAdmin(admin.id)} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
