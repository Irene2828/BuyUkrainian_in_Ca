import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Store } from "@/lib/data";
import { getAllStores, updateStoreStatus, updateStoreImages, updateStore, deleteStore, getAdminUsers, updateAdminPassword, createAdminUser, deleteAdminUser, AdminUser } from "@/lib/api";
import { logout, isAuthenticated, verifySession } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminStoreCard, BrandCircle } from "@/components/AdminStoreCard";
import { StoreCard } from "@/components/store-card";
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
    Settings,
    Check,
    Plus,
    User,
    Key,
    Edit3,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ToastAction } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
    submissions?: Store[];
}

type TabType = "pending" | "live" | "trash" | "drafts" | "settings";

export function AdminDashboard({ submissions: propSubmissions }: AdminDashboardProps) {
    const { toast } = useToast();
    const [_, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>("pending");
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editWebsite, setEditWebsite] = useState("");
    const [editCategory, setEditCategory] = useState<"food" | "clothes" | "retail" | "other">("food");
    const [editProducts, setEditProducts] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editImages, setEditImages] = useState<string[]>([]);
    const [localImagePreviews, setLocalImagePreviews] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [isDragOver, setIsDragOver] = useState(false);
    const [drafts, setDrafts] = useState<any[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [cityFilter, setCityFilter] = useState<string>("");
    const [sortBy, setSortBy] = useState<"date" | "name">("date");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bulkInputRef = useRef<HTMLInputElement>(null);

    // Settings State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
    const [targetUserId, setTargetUserId] = useState<number | null>(null);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [storeToView, setStoreToView] = useState<Store | null>(null);

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
        mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" | "pending" }) =>
            updateStoreStatus(id, status),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ["admin-stores"] });
            queryClient.refetchQueries({ queryKey: ["stores"] });
        },
    });

    const updateStoreMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: { name?: string; address?: string; website?: string; category?: string; products?: string[]; description?: string } }) =>
            updateStore(id, updates),
        onSuccess: (data) => {
            queryClient.refetchQueries({ queryKey: ["admin-stores"] });
            queryClient.refetchQueries({ queryKey: ["stores"] });
            if (selectedStore && selectedStore.id === data.id) {
                setSelectedStore(data);
            }
            toast({ title: "Store Updated", description: "Store details have been updated." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const updateImagesMutation = useMutation({
        mutationFn: ({ id, images }: { id: string; images: string[] }) =>
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
        mutationFn: (id: string) => deleteStore(id),
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ["admin-stores"] });
            queryClient.refetchQueries({ queryKey: ["stores"] });
            toast({ title: "Store Deleted", description: "The store has been removed." });
            setIsEditModalOpen(false);
            setSelectedStore(null);
        },
    });

    // User Management Mutations
    const updatePasswordMutation = useMutation({
        mutationFn: ({ id, password }: { id: number; password: string }) =>
            updateAdminPassword(id, password),
        onSuccess: () => {
            toast({ title: "Password Updated", description: "The password has been changed successfully." });
            setIsPasswordModalOpen(false);
            setNewPassword("");
            setConfirmPassword("");
            setTargetUserId(null);
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const createUserMutation = useMutation({
        mutationFn: ({ username, password }: { username: string; password: string }) =>
            createAdminUser(username, password),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast({ title: "User Created", description: "New admin user has been added." });
            setIsNewUserModalOpen(false);
            setNewUsername("");
            setNewPassword("");
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: number) => deleteAdminUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast({ title: "User Deleted", description: "Admin user has been removed." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    // Data
    const allStores = propSubmissions || stores;
    const pendingStores = allStores.filter((s) => s.status === "pending");
    const liveStores = allStores.filter((s) => s.status === "approved");
    const trashedStores = allStores.filter((s) => s.status === "rejected");

    const getDisplayedStores = () => {
        let items: any[] = [];
        switch (activeTab) {
            case "pending": items = pendingStores; break;
            case "live": items = liveStores; break;
            case "trash": items = trashedStores; break;
            case "drafts": items = drafts; break;
            case "settings": items = []; break;
            default: items = [];
        }
        // Apply category filter
        if (categoryFilter) {
            items = items.filter((s: any) => s.category === categoryFilter);
        }
        // Apply city filter
        if (cityFilter.trim()) {
            const query = cityFilter.toLowerCase();
            items = items.filter((s: any) =>
                s.address?.toLowerCase().includes(query) ||
                s.city?.toLowerCase().includes(query)
            );
        }
        // Sort
        if (sortBy === "name") {
            items = [...items].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        }
        return items;
    };

    const displayedStores = getDisplayedStores();

    // Get unique cities for filter
    const allCities = Array.from(new Set(allStores.map(s => s.address?.split(',').pop()?.trim()).filter(Boolean)));

    // Handlers
    const handleApprove = async (id: string) => {
        try {
            await updateStatusMutation.mutateAsync({ id, status: "approved" });
            toast({ title: "Store Approved ✓", description: "The store is now live on the map!" });
        } catch {
            toast({ title: "Error", description: "Failed to approve store.", variant: "destructive" });
        }
    };

    const handleMoveToTrash = async (id: string, fromStatus: "pending" | "approved") => {
        try {
            await updateStatusMutation.mutateAsync({ id, status: "rejected" });
            toast({
                title: "Moved to Trash",
                description: "Store removed from list.",
                action: (
                    <ToastAction altText="Undo" onClick={() =>
                        updateStatusMutation.mutateAsync({ id, status: fromStatus })
                    }>
                        Undo
                    </ToastAction>
                ),
            });
        } catch {
            toast({ title: "Error", description: "Failed to move to trash.", variant: "destructive" });
        }
    };

    const handleReject = async (id: string) => {
        handleMoveToTrash(id, "pending");
    };

    const handleRestore = async (id: string) => {
        try {
            await updateStatusMutation.mutateAsync({ id, status: "pending" });
            toast({ title: "Store Restored", description: "Moved back to pending review." });
        } catch {
            toast({ title: "Error", description: "Failed to restore store.", variant: "destructive" });
        }
    };

    const handlePermanentDelete = async (id: string) => {
        if (confirm("Permanently delete this store? This cannot be undone.")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const openEditModal = (store: Store) => {
        setSelectedStore(store);
        setEditName(store.name);
        setEditAddress(store.address);
        setEditWebsite(store.website || "");
        setEditCategory(store.category || "food");
        setEditProducts(store.products?.join(", ") || "");
        setEditDescription(store.description || "");
        setEditImages(store.images || []);
        setLocalImagePreviews([]);
        setIsEditModalOpen(true);
    };

    const handleResetChanges = () => {
        if (!selectedStore) return;
        setEditName(selectedStore.name);
        setEditAddress(selectedStore.address);
        setEditWebsite(selectedStore.website || "");
        setEditCategory(selectedStore.category || "food");
        setEditProducts(selectedStore.products?.join(", ") || "");
        setEditDescription(selectedStore.description || "");
        setEditImages(selectedStore.images || []);
        setLocalImagePreviews([]);
    };

    // Calculate hasChanges for UI state
    const hasChanges = selectedStore ? (
        editName !== selectedStore.name ||
        editAddress !== selectedStore.address ||
        editWebsite !== (selectedStore.website || "") ||
        editCategory !== (selectedStore.category || "food") ||
        JSON.stringify(editProducts.split(',').map(p => p.trim()).filter(Boolean)) !== JSON.stringify(selectedStore.products || []) ||
        editDescription !== (selectedStore.description || "") ||
        JSON.stringify(editImages) !== JSON.stringify(selectedStore.images || []) ||
        localImagePreviews.length > 0
    ) : false;

    const handleSaveEdit = async () => {
        if (!selectedStore) return;

        if (!hasChanges) {
            toast({ title: "Saved", description: "Store details saved." });
            setIsEditModalOpen(false);
            setSelectedStore(null);
            return;
        }

        if (hasChanges) {
            const productsArray = editProducts.split(',').map(p => p.trim()).filter(Boolean);
            await updateStoreMutation.mutateAsync({
                id: selectedStore.id,
                updates: {
                    name: editName,
                    address: editAddress,
                    website: editWebsite,
                    category: editCategory,
                    products: productsArray,
                    description: editDescription
                },
            });
        }

        // Handle images separately
        const allImages = [...editImages, ...localImagePreviews].slice(0, 3);
        if (JSON.stringify(allImages) !== JSON.stringify(selectedStore.images)) {
            await updateImagesMutation.mutateAsync({
                id: selectedStore.id,
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
        const validFiles = Array.from(files).slice(0, remaining);

        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (result) {
                    setLocalImagePreviews((prev) => [...prev, result].slice(0, 3 - editImages.length));
                }
            };
            reader.readAsDataURL(file);
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

    const handlePasswordUpdate = () => {
        if (!targetUserId || !newPassword) return;
        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
            return;
        }
        updatePasswordMutation.mutate({ id: targetUserId, password: newPassword });
    };

    const handleCreateUser = () => {
        if (!newUsername || !newPassword) return;
        createUserMutation.mutate({ username: newUsername, password: newPassword });
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
        { id: "settings", label: "Settings", icon: Settings, count: adminUsers.length, color: "gray" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Left Sidebar */}
            <aside className="w-[260px] bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
                {/* Logo */}
                <div className="p-6 border-b border-gray-50 flex justify-center">
                    <Link href="/" className="flex flex-col items-center gap-0">
                        <img
                            src="/assets/logo-final.png"
                            alt="BuyUkrainian.ca"
                            className="w-[190px] h-[90px] object-contain"
                        />
                    </Link>
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
                        <h2 className="font-medium tracking-tight font-header">
                            {activeTab === "pending" ? "Admin Dashboard" :
                                activeTab === "live" ? "Live Stores" :
                                    activeTab === "trash" ? "Trash" :
                                        activeTab === "settings" ? "Settings" : "Bulk Drafts"}
                        </h2>
                        <p className="text-[18px] text-gray-600 mt-1 font-ui">
                            {activeTab === "pending" ? "Hi, admin" :
                                activeTab === "live" ? "Manage live store listings" :
                                    activeTab === "trash" ? "Restore or permanently delete stores" :
                                        activeTab === "settings" ? "Manage admin users and passwords" : "Import and review bulk uploads"}
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
                        <a
                            href="/"
                            target="_blank"
                            className="flex items-center gap-2 text-[14px] text-gray-500 hover:text-[#D3E4FD] transition-colors font-ui"
                        >
                            View Site <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Filter Bar */}
                {activeTab !== "settings" && (
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        {/* Category Chips */}
                        <div className="flex items-center gap-2">
                            {[
                                { id: null, label: "All" },
                                { id: "food", label: "Food" },
                                { id: "clothes", label: "Clothing" },
                                { id: "retail", label: "Retail" },
                                { id: "other", label: "Gifts" },
                            ].map((cat) => (
                                <button
                                    key={cat.id || "all"}
                                    onClick={() => setCategoryFilter(cat.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-[13px] font-medium transition-all font-ui",
                                        categoryFilter === cat.id
                                            ? "bg-[#D3E4FD] text-black"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        {/* City Search */}
                        <input
                            type="text"
                            placeholder="Filter by city..."
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            className="px-4 py-2 rounded-full border border-gray-200 text-[13px] w-[180px] font-ui focus:border-[#D3E4FD] outline-none"
                        />
                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "date" | "name")}
                            className="px-4 py-2 rounded-full border border-gray-200 text-[13px] font-ui bg-white outline-none focus:border-[#D3E4FD]"
                        >
                            <option value="date">Sort: Date Added</option>
                            <option value="name">Sort: Name</option>
                        </select>
                    </div>
                )}

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
                {activeTab !== "settings" && (
                    <>
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
                                        <div key={store.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openEditModal(store)}>
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
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(store); }}
                                                            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                                            title="Edit Details"
                                                        >
                                                            <Edit3 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleApprove(store.id); }}
                                                            className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleReject(store.id); }}
                                                            className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === "trash" && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleRestore(store.id); }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors font-ui"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" /> Restore
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handlePermanentDelete(store.id); }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors font-ui"
                                                        >
                                                            <AlertTriangle className="w-3.5 h-3.5" /> Purge
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === "live" && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(store); }}
                                                            className="text-[13px] font-medium text-gray-500 hover:text-black transition-colors font-ui"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMoveToTrash(store.id, "approved"); }}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                            title="Move to Trash"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === "drafts" && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleApprove(store.id); }}
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
                                        onView={setStoreToView}
                                    />
                                ))}
                            </div>
                        )}

                    </>
                )}
                {/* Settings View */}
                {activeTab === "settings" && (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-lg font-header">Admin Users</h3>
                            <Button onClick={() => setIsNewUserModalOpen(true)} className="gap-2">
                                <Plus className="w-4 h-4" /> Add User
                            </Button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {adminUsers.map((user: AdminUser) => (
                                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-black font-ui">{user.username}</p>
                                            <p className="text-xs text-gray-400 font-ui">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setTargetUserId(user.id);
                                                setNewPassword("");
                                                setConfirmPassword("");
                                                setIsPasswordModalOpen(true);
                                            }}
                                            className="gap-2"
                                        >
                                            <Key className="w-4 h-4" /> Change Password
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm("Delete this user?")) deleteUserMutation.mutate(user.id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold font-header">Edit Store Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label htmlFor="editName" className="font-ui text-[11px] font-bold text-gray-400 uppercase tracking-wider">Store Name</Label>
                            <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter store name" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editAddress" className="font-ui text-[11px] font-bold text-gray-400 uppercase tracking-wider">Address</Label>
                            <Input id="editAddress" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Enter store address" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editWebsite" className="font-ui text-[11px] font-bold text-gray-400 uppercase tracking-wider">Website</Label>
                            <Input id="editWebsite" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="https://example.com" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editCategory" className="font-ui text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</Label>
                            <select
                                id="editCategory"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value as any)}
                                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#D3E4FD] transition-all font-ui"
                            >
                                <option value="food">Food & Grocery</option>
                                <option value="clothes">Clothing & Apparel</option>
                                <option value="retail">Retail & Gifts</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editProducts" className="font-ui text-[11px] font-bold text-gray-400 uppercase tracking-wider">Products Sold</Label>
                            <Input id="editProducts" value={editProducts} onChange={(e) => setEditProducts(e.target.value)} placeholder="Pierogies, Bread, Sausages..." className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editDescription" className="font-ui text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</Label>
                            <textarea
                                id="editDescription"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="What makes this store special..."
                                className="w-full min-h-[80px] px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#D3E4FD] transition-all font-ui resize-none"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="font-ui text-[11px] font-bold text-gray-400 uppercase tracking-wider">Images (max 3)</Label>
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
                    <DialogFooter className="flex gap-2 pt-4 border-t border-gray-100 sm:justify-end">
                        <Button
                            variant="destructive"
                            size="default"
                            onClick={() => {
                                if (selectedStore) {
                                    handleMoveToTrash(selectedStore.id, "approved");
                                    setIsEditModalOpen(false);
                                }
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResetChanges}
                            className={cn(hasChanges ? "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" : "")}
                        >
                            Undo Save
                        </Button>
                        <Button onClick={handleSaveEdit} className="bg-black hover:bg-black/90">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Change Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPass">New Password</Label>
                            <Input
                                id="newPass"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPass">Confirm Password</Label>
                            <Input
                                id="confirmPass"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                        <Button onClick={handlePasswordUpdate}>Update Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New User Modal */}
            <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Admin User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newUsername">Username</Label>
                            <Input
                                id="newUsername"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newUserPass">Password</Label>
                            <Input
                                id="newUserPass"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewUserModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateUser}>Create User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Store Preview Modal */}
            <Dialog open={!!storeToView} onOpenChange={(open) => !open && setStoreToView(null)}>
                <DialogContent
                    className="max-w-[400px] w-full p-0 border-none bg-transparent shadow-none"
                    hideClose
                >
                    {storeToView && (
                        <StoreCard
                            store={storeToView}
                            onClose={() => setStoreToView(null)}
                            actionSlot={
                                <div className="flex flex-col gap-3 w-full pt-2">
                                    {activeTab === "pending" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button className="h-12 bg-green-600 hover:bg-green-700 rounded-full font-medium" onClick={() => { handleApprove(storeToView.id); setStoreToView(null); }}>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button variant="destructive" className="h-12 rounded-full font-medium" onClick={() => { handleReject(storeToView.id); setStoreToView(null); }}>
                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    )}
                                    {activeTab === "live" && (
                                        <Button className="h-12 w-full bg-black hover:bg-black/90 rounded-full font-medium" onClick={() => { openEditModal(storeToView); setStoreToView(null); }}>
                                            Edit Details
                                        </Button>
                                    )}
                                    {activeTab === "trash" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button className="h-12 rounded-full font-medium" variant="outline" onClick={() => { handleRestore(storeToView.id); setStoreToView(null); }}>
                                                <RotateCcw className="w-4 h-4 mr-2" /> Restore
                                            </Button>
                                            <Button className="h-12 rounded-full font-medium" variant="destructive" onClick={() => { handlePermanentDelete(storeToView.id); setStoreToView(null); }}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Purge
                                            </Button>
                                        </div>
                                    )}
                                    {activeTab === "drafts" && (
                                        <Button className="h-12 w-full bg-black hover:bg-black/90 rounded-full font-medium" onClick={() => { handleApprove(storeToView.id); setStoreToView(null); }}>
                                            Publish
                                        </Button>
                                    )}
                                </div>
                            }
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}
