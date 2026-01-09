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
    RotateCcw,
    AlertTriangle,
    TrendingUp,
    FileSpreadsheet,
    CheckCircle,
    XCircle,
    Image,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
    submissions?: Store[];
}

type TabType = "pending" | "live" | "trash" | "drafts";

export function AdminDashboard({ submissions: propSubmissions }: AdminDashboardProps) {
    const { toast } = useToast();
    const [_, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>("pending");
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editImages, setEditImages] = useState<string[]>([]);
    const [localImagePreviews, setLocalImagePreviews] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [isDragOver, setIsDragOver] = useState(false);
    const [drafts, setDrafts] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bulkInputRef = useRef<HTMLInputElement>(null);

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
    const liveStores = allStores.filter((s) => s.status === "approved");
    const trashedStores = allStores.filter((s) => s.status === "rejected");

    const getDisplayedStores = () => {
        switch (activeTab) {
            case "pending": return pendingStores;
            case "live": return liveStores;
            case "trash": return trashedStores;
            case "drafts": return drafts;
            default: return [];
        }
    };

    const displayedStores = getDisplayedStores();

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
            toast({ title: "Moved to Trash", variant: "destructive" });
        } catch {
            toast({ title: "Error", description: "Failed to reject store.", variant: "destructive" });
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await updateStatusMutation.mutateAsync({ id: parseInt(id), status: "pending" });
            toast({ title: "Store Restored", description: "Moved back to pending review." });
        } catch {
            toast({ title: "Error", description: "Failed to restore store.", variant: "destructive" });
        }
    };

    const handlePermanentDelete = async (id: string) => {
        if (confirm("Permanently delete this store? This cannot be undone.")) {
            await deleteMutation.mutateAsync(parseInt(id));
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
        if (editName !== selectedStore.name || editAddress !== selectedStore.address) {
            await updateStoreMutation.mutateAsync({
                id: parseInt(selectedStore.id),
                updates: { name: editName, address: editAddress },
            });
        }
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

    // Bulk Import Handler
    const handleBulkImport = useCallback((files: FileList) => {
        const file = files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').slice(1); // Skip header
            const newDrafts = lines.filter(line => line.trim()).map((line, index) => {
                const [name, address, category] = line.split(',').map(s => s.trim().replace(/"/g, ''));
                return {
                    id: `draft-${Date.now()}-${index}`,
                    name: name || 'Unknown Store',
                    address: address || '',
                    category: category || 'food',
                    status: 'draft',
                    products: [],
                    description: '',
                    images: [],
                };
            });
            setDrafts(prev => [...prev, ...newDrafts]);
            toast({ title: "Import Complete", description: `${newDrafts.length} stores added to Drafts.` });
        };
        reader.readAsText(file);
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleBulkImport(e.dataTransfer.files);
        }
    };

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

    const tabs: { id: TabType; label: string; icon: any; count: number; color: string }[] = [
        { id: "pending", label: "Pending", icon: FileText, count: pendingStores.length, color: "orange" },
        { id: "live", label: "Live", icon: MapPin, count: liveStores.length, color: "green" },
        { id: "trash", label: "Trash", icon: Trash2, count: trashedStores.length, color: "red" },
        { id: "drafts", label: "Drafts", icon: FileSpreadsheet, count: drafts.length, color: "blue" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Left Sidebar */}
            <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
                {/* Logo */}
                <div className="p-6 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-brand-blue-logo"></div>
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-brand-yellow-logo"></div>
                        </div>
                        <div>
                            <span className="font-bold text-[16px] text-black font-header">Command Center</span>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium font-ui">Admin Console</p>
                        </div>
                    </div>
                </div>

                {/* Traffic Pulse */}
                <div className="px-6 py-4 border-b border-gray-50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-ui">Traffic Pulse</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="h-10 bg-gray-50 rounded-lg flex items-end px-2 pb-1 gap-0.5">
                        {[30, 45, 25, 60, 80, 55, 70, 90, 65, 75, 85, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-[#D3E4FD] rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-ui">Last 30 days</p>
                </div>

                {/* Tab Navigation */}
                <nav className="flex-1 p-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4 font-ui">
                        Moderation
                    </p>
                    <ul className="space-y-1">
                        {tabs.map((tab) => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all font-ui",
                                        activeTab === tab.id
                                            ? "bg-black text-white"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <tab.icon className="w-5 h-5" />
                                        {tab.label}
                                    </div>
                                    <span className={cn(
                                        "text-[12px] px-2 py-0.5 rounded-full",
                                        activeTab === tab.id ? "bg-white/20" :
                                            tab.color === "orange" ? "bg-orange-100 text-orange-600" :
                                                tab.color === "green" ? "bg-green-100 text-green-600" :
                                                    tab.color === "red" ? "bg-red-100 text-red-600" :
                                                        "bg-blue-100 text-blue-600"
                                    )}>
                                        {tab.count}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Stats */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4 font-ui">
                            Stats
                        </p>
                        <div className="space-y-3 px-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500 font-ui">Total Stores</span>
                                <span className="text-[15px] font-bold text-black font-ui">{allStores.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-gray-500 font-ui">Team Members</span>
                                <span className="text-[15px] font-bold text-black font-ui">{adminUsers.length || 1}</span>
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
                            <p className="text-[14px] font-semibold text-gray-900 truncate font-ui">Admin User</p>
                            <button
                                onClick={handleLogout}
                                className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 font-ui"
                            >
                                <LogOut className="w-3 h-3" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[260px] p-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-[32px] font-medium text-black tracking-tight font-header">
                            {activeTab === "pending" ? "Pending Submissions" :
                                activeTab === "live" ? "Live Stores" :
                                    activeTab === "trash" ? "Trash" : "Bulk Drafts"}
                        </h1>
                        <p className="text-[16px] text-gray-400 mt-1 font-ui">
                            {activeTab === "pending" ? "Review and approve store submissions" :
                                activeTab === "live" ? "Manage live store listings" :
                                    activeTab === "trash" ? "Restore or permanently delete stores" : "Import and review bulk uploads"}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Bulk Import Button */}
                        <button
                            onClick={() => bulkInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-[#D3E4FD] text-black rounded-full font-medium text-[14px] hover:bg-[#D3E4FD]/80 transition-all font-ui"
                        >
                            <Upload className="w-4 h-4" /> Bulk Import
                        </button>
                        <input
                            type="file"
                            ref={bulkInputRef}
                            onChange={(e) => e.target.files && handleBulkImport(e.target.files)}
                            accept=".csv,.xlsx"
                            className="hidden"
                        />
                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "p-2 rounded-md transition-all",
                                    viewMode === "list" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "p-2 rounded-md transition-all",
                                    viewMode === "grid" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                        </div>
                        <a
                            href="/"
                            target="_blank"
                            className="flex items-center gap-2 text-[14px] text-gray-500 hover:text-[#D3E4FD] transition-colors font-ui"
                        >
                            View Site <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Bulk Import Drop Zone (visible on Drafts tab) */}
                {activeTab === "drafts" && (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "mb-8 border-2 border-dashed rounded-2xl p-8 text-center transition-all",
                            isDragOver ? "border-[#D3E4FD] bg-[#D3E4FD]/10" : "border-gray-200 bg-white"
                        )}
                    >
                        <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-[16px] font-medium text-gray-600 mb-2 font-ui">Drop CSV or Excel file here</p>
                        <p className="text-[13px] text-gray-400 font-ui">Format: Store Name, Address, Category</p>
                    </div>
                )}

                {/* Store Grid/List */}
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
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                        {activeTab === "drafts" ? <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-200 mb-4" /> :
                            activeTab === "trash" ? <Trash2 className="w-16 h-16 mx-auto text-gray-200 mb-4" /> :
                                <FileText className="w-16 h-16 mx-auto text-gray-200 mb-4" />}
                        <p className="text-gray-400 text-lg font-ui">
                            {activeTab === "pending" ? "No pending submissions" :
                                activeTab === "live" ? "No live stores yet" :
                                    activeTab === "trash" ? "Trash is empty" : "No drafts yet"}
                        </p>
                    </div>
                ) : viewMode === "list" ? (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-50">
                            {displayedStores.map((store: any) => (
                                <div key={store.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {store.images?.[0] ? (
                                                <img src={store.images[0]} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Image className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-[15px] text-black truncate font-ui">{store.name}</p>
                                            <p className="text-[13px] text-gray-400 truncate font-ui">{store.address || store.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activeTab === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(store.id)}
                                                    className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(store.id)}
                                                    className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        {activeTab === "trash" && (
                                            <>
                                                <button
                                                    onClick={() => handleRestore(store.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors font-ui"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDelete(store.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors font-ui"
                                                >
                                                    <AlertTriangle className="w-3.5 h-3.5" /> Purge
                                                </button>
                                            </>
                                        )}
                                        {activeTab === "live" && (
                                            <button
                                                onClick={() => openEditModal(store)}
                                                className="text-[13px] font-medium text-gray-500 hover:text-black transition-colors font-ui"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {activeTab === "drafts" && (
                                            <button
                                                onClick={() => handleApprove(store.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium bg-black text-white rounded-full hover:bg-black/90 transition-colors font-ui"
                                            >
                                                Publish
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-[12px] text-gray-500 font-ui">
                            Showing {displayedStores.length} items
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedStores.map((store: any) => (
                            <AdminStoreCard
                                key={store.id}
                                store={store}
                                viewMode="grid"
                                showActions={activeTab === "pending"}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onEdit={openEditModal}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-[20px] font-semibold font-header">Edit Store Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editName" className="font-ui">Store Name</Label>
                            <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter store name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editAddress" className="font-ui">Address</Label>
                            <Input id="editAddress" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Enter store address" />
                        </div>
                        <div className="space-y-3">
                            <Label className="font-ui">Images (max 3)</Label>
                            <div className="grid grid-cols-3 gap-3">
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
                                {localImagePreviews.map((url, index) => (
                                    <div key={`local-${index}`} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded font-medium">NEW</div>
                                        <button
                                            onClick={() => removeImage(index, true)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {editImages.length + localImagePreviews.length < 3 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#D3E4FD] hover:text-[#D3E4FD] transition-colors"
                                    >
                                        <Upload className="w-6 h-6 mb-1" />
                                        <span className="text-[11px] font-medium font-ui">Upload</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />
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
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
