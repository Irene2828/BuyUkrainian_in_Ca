import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Store } from "@/lib/data";
import { getAllStores, updateStoreStatus, updateStoreImages, updateStore, deleteStore, getAdminUsers, AdminUser } from "@/lib/api";
import { logout, isAuthenticated, verifySession } from "@/lib/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminStoreCard, BrandCircle } from "@/components/AdminStoreCard";
import {
    FileText,
    MapPin,
    Users,
    X,
    LogOut,
    Upload,
    Trash2,
    ExternalLink,
    Grid3X3,
    List,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface AdminDashboardProps {
    submissions?: Store[];
}

export function AdminDashboard({ submissions: propSubmissions }: AdminDashboardProps) {
    const { toast } = useToast();
    const [_, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const [activeFilter, setActiveFilter] = useState<"pending" | "approved">("pending");
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editImages, setEditImages] = useState<string[]>([]);
    const [localImagePreviews, setLocalImagePreviews] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auth check
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

    // Fetch stores
    const { data: stores = [], isLoading } = useQuery({
        queryKey: ["admin-stores"],
        queryFn: getAllStores,
        enabled: !propSubmissions,
        staleTime: 0,
        refetchOnMount: true,
    });

    const { data: adminUsers = [] } = useQuery({
        queryKey: ["admin-users"],
        queryFn: getAdminUsers,
        retry: false,
    });

    // Mutations
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) =>
            updateStoreStatus(id, status),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ["admin-stores"] });
            queryClient.refetchQueries({ queryKey: ["stores"] });
        },
    });

    const updateStoreMutation = useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: { name?: string; address?: string } }) =>
            updateStore(id, updates),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ["admin-stores"] });
            queryClient.refetchQueries({ queryKey: ["stores"] });
            toast({ title: "Store Updated", description: "Store details have been updated." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const updateImagesMutation = useMutation({
        mutationFn: ({ id, images }: { id: number; images: string[] }) =>
            updateStoreImages(id, images),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ["admin-stores"] });
            queryClient.refetchQueries({ queryKey: ["stores"] });
            toast({ title: "Images Updated", description: "Store images have been updated." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteStore(id),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ["admin-stores"] });
            queryClient.refetchQueries({ queryKey: ["stores"] });
            toast({ title: "Store Deleted", description: "The store has been removed." });
            setIsEditModalOpen(false);
            setSelectedStore(null);
        },
    });

    // Data
    const allStores = propSubmissions || stores;
    const pendingStores = allStores.filter((s) => s.status === "pending");
    const approvedStores = allStores.filter((s) => s.status === "approved");
    const displayedStores = activeFilter === "pending" ? pendingStores : approvedStores;

    // Handlers
    const handleApprove = async (id: string) => {
        try {
            await updateStatusMutation.mutateAsync({ id: parseInt(id), status: "approved" });
            toast({ title: "Store Approved ✓", description: "The store is now live on the map!" });
        } catch {
            toast({ title: "Error", description: "Failed to approve store.", variant: "destructive" });
        }
    };

    const handleReject = async (id: string) => {
        try {
            await updateStatusMutation.mutateAsync({ id: parseInt(id), status: "rejected" });
            toast({ title: "Store Rejected", variant: "destructive" });
        } catch {
            toast({ title: "Error", description: "Failed to reject store.", variant: "destructive" });
        }
    };

    const openEditModal = (store: Store) => {
        setSelectedStore(store);
        setEditName(store.name);
        setEditAddress(store.address);
        setEditImages(store.images || []);
        setLocalImagePreviews([]);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedStore) return;

        // Update store details
        if (editName !== selectedStore.name || editAddress !== selectedStore.address) {
            await updateStoreMutation.mutateAsync({
                id: parseInt(selectedStore.id),
                updates: { name: editName, address: editAddress },
            });
        }

        // Update images (combine URL images with any new ones)
        const allImages = [...editImages, ...localImagePreviews].slice(0, 3);
        if (JSON.stringify(allImages) !== JSON.stringify(selectedStore.images)) {
            await updateImagesMutation.mutateAsync({
                id: parseInt(selectedStore.id),
                images: allImages,
            });
        }

        setIsEditModalOpen(false);
        setSelectedStore(null);
    };

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const currentTotal = editImages.length + localImagePreviews.length;
        const remaining = 3 - currentTotal;

        Array.from(files).slice(0, remaining).forEach((file) => {
            const previewUrl = URL.createObjectURL(file);
            setLocalImagePreviews((prev) => [...prev, previewUrl].slice(0, 3 - editImages.length));
        });
    }, [editImages.length, localImagePreviews.length]);

    const removeImage = (index: number, isLocal: boolean) => {
        if (isLocal) {
            setLocalImagePreviews((prev) => prev.filter((_, i) => i !== index));
        } else {
            setEditImages((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleLogout = async () => {
        await logout();
        setLocation("/admin/login");
    };

    return (
        <div className="min-h-screen bg-admin-bg flex">
            {/* Left Sidebar */}
            <aside className="w-[240px] bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
                {/* Logo */}
                <div className="p-6 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-sm overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-brand-blue-logo"></div>
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-brand-yellow-logo"></div>
                        </div>
                        <div>
                            <span className="font-bold text-[15px] text-admin-text">BuyUkrainian.ca</span>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Admin Console</p>
                        </div>
                    </div>
                </div>

                {/* Filter Navigation */}
                <nav className="flex-1 p-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                        Review Queue
                    </p>
                    <ul className="space-y-1">
                        <li>
                            <button
                                onClick={() => setActiveFilter("pending")}
                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${activeFilter === "pending"
                                    ? "bg-admin-text text-white"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5" />
                                    Pending
                                </div>
                                <span className={`text-[12px] px-2 py-0.5 rounded-full ${activeFilter === "pending" ? "bg-white/20" : "bg-orange-100 text-orange-600"
                                    }`}>
                                    {pendingStores.length}
                                </span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveFilter("approved")}
                                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${activeFilter === "approved"
                                    ? "bg-admin-text text-white"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5" />
                                    Approved
                                </div>
                                <span className={`text-[12px] px-2 py-0.5 rounded-full ${activeFilter === "approved" ? "bg-white/20" : "bg-green-100 text-green-600"
                                    }`}>
                                    {approvedStores.length}
                                </span>
                            </button>
                        </li>
                    </ul>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                            Stats
                        </p>
                        <div className="space-y-3 px-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500">Total Submissions</span>
                                <span className="text-[15px] font-bold text-admin-text">{allStores.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500">Team Members</span>
                                <span className="text-[15px] font-bold text-admin-text">{adminUsers.length || 1}</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-gray-900 truncate">Admin User</p>
                            <button
                                onClick={handleLogout}
                                className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                            >
                                <LogOut className="w-3 h-3" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[240px] p-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-[28px] font-semibold text-admin-text tracking-tight">
                            {activeFilter === "pending" ? "Pending Submissions" : "Approved Stores"}
                        </h1>
                        <p className="text-[15px] text-gray-500 mt-1">
                            {activeFilter === "pending"
                                ? "Review and approve store submissions"
                                : "Manage live store listings"}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-admin-text" : "text-gray-400 hover:text-gray-600"
                                    }`}
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-admin-text" : "text-gray-400 hover:text-gray-600"
                                    }`}
                                title="Grid View"
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                        </div>
                        <a
                            href="/"
                            target="_blank"
                            className="flex items-center gap-2 text-[14px] text-gray-500 hover:text-brand-blue-logo transition-colors"
                        >
                            View Live Site <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Store Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                                <div className="h-32 bg-gray-100 rounded-xl mb-4"></div>
                                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : displayedStores.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <FileText className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 text-lg">
                            {activeFilter === "pending" ? "No pending submissions" : "No approved stores yet"}
                        </p>
                    </div>
                ) : viewMode === "list" ? (
                    /* List View - Using AdminStoreCard component */
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-50">
                            {displayedStores.map((store) => (
                                <AdminStoreCard
                                    key={store.id}
                                    store={store}
                                    viewMode="list"
                                    showActions={activeFilter === "pending"}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onEdit={openEditModal}
                                />
                            ))}
                        </div>

                        {/* Footer with count */}
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-[12px] text-gray-500">
                            Showing {displayedStores.length} {activeFilter} submissions
                        </div>
                    </div>
                ) : (
                    /* Grid View - Using AdminStoreCard component */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedStores.map((store) => (
                            <AdminStoreCard
                                key={store.id}
                                store={store}
                                viewMode="grid"
                                showActions={activeFilter === "pending"}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onEdit={openEditModal}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Edit Modal / Drawer */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-[20px] font-semibold">Edit Store Details</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        {/* Store Name */}
                        <div className="space-y-2">
                            <Label htmlFor="editName">Store Name</Label>
                            <Input
                                id="editName"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Enter store name"
                            />
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="editAddress">Address</Label>
                            <Input
                                id="editAddress"
                                value={editAddress}
                                onChange={(e) => setEditAddress(e.target.value)}
                                placeholder="Enter store address"
                            />
                        </div>

                        {/* Image Gallery */}
                        <div className="space-y-3">
                            <Label>Images (max 3)</Label>

                            {/* 3-Column Image Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {/* Existing URL Images */}
                                {editImages.map((url, index) => (
                                    <div key={`url-${index}`} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(index, false)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {/* Local Preview Images */}
                                {localImagePreviews.map((url, index) => (
                                    <div key={`local-${index}`} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded font-medium">
                                            NEW
                                        </div>
                                        <button
                                            onClick={() => removeImage(index, true)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {/* Upload Button */}
                                {editImages.length + localImagePreviews.length < 3 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-brand-blue-logo hover:text-brand-blue-logo transition-colors"
                                    >
                                        <Upload className="w-6 h-6 mb-1" />
                                        <span className="text-[11px] font-medium">Upload</span>
                                    </button>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                            <p className="text-[12px] text-gray-400">
                                Upload images or paste URLs. First image will be the thumbnail.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => selectedStore && deleteMutation.mutate(parseInt(selectedStore.id))}
                        >
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                        <div className="flex-1" />
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
