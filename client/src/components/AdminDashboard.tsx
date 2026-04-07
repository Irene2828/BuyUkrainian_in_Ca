import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Store } from "@/lib/data";
import { getAllStores, updateStoreStatus, updateStoreImages, updateStore, deleteStore, getAdminUsers, updateAdminPassword, createAdminUser, deleteAdminUser, AdminUser, createStore } from "@/lib/api";


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
    Loader2,
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
import { SiteBrandLockup } from "@/components/site-brand-lockup";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import imageCompression from 'browser-image-compression';
import { GripVertical } from 'lucide-react';

const adminInputClassName =
    "h-[48px] rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-[#1E293B] shadow-none transition-colors hover:shadow-none focus-visible:border-[#0057B7]/40 focus-visible:ring-0 focus-visible:ring-offset-0";

const adminTextareaClassName =
    "min-h-[104px] rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-sm text-[#1E293B] shadow-none transition-colors hover:shadow-none focus-visible:border-[#0057B7]/40 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none";

const adminPrimaryButtonClassName =
    "h-[46px] rounded-full bg-[#0057B7] px-6 text-[14px] font-medium tracking-tight text-white shadow-[0_4px_14px_0_rgba(0,87,183,0.26)] transition-all duration-300 hover:bg-[#0047A0] hover:shadow-[0_6px_20px_rgba(0,87,183,0.34)] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0057B7]/30";

const adminSectionLabelClassName =
    "mb-2 mt-4 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400/80 border-b border-slate-100 pb-1.5 flex items-center justify-between";

const adminFieldLabelClassName =
    "mb-2 block text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500";

interface SortableStoreRowProps {
    store: any;
    selectedIds: Set<string>;
    activeTab: string;
    toggleSelect: (id: string) => void;
    openEditModal: (store: any) => void;
    handleApprove: (id: string) => void;
    handleReject: (id: string) => void;
    handleRestore: (id: string) => void;
    handlePermanentDelete: (id: string) => void;
    handleMoveToTrash: (id: string, status: "approved") => void;
    handleDeleteDraft: (id: string) => void;
}

function SortableStoreRow({
    store,
    selectedIds,
    activeTab,
    toggleSelect,
    openEditModal,
    handleApprove,
    handleReject,
    handleRestore,
    handlePermanentDelete,
    handleMoveToTrash,
    handleDeleteDraft
}: SortableStoreRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: store.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        position: "relative" as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center justify-between gap-4 border-b border-slate-100 p-4 transition-colors",
                isDragging
                    ? "z-50 scale-[1.02] rounded-[18px] bg-white shadow-xl ring-1 ring-black/5"
                    : "bg-white hover:bg-[#EFF6FF]/40",
                selectedIds.has(store.id) && "bg-[#EFF6FF]"
            )}
            onClick={() => openEditModal(store)}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Drag Handle for Live Tab */}
                {activeTab === 'live' && (
                    <div {...attributes} {...listeners} className="p-1 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500">
                        <GripVertical className="w-4 h-4" />
                    </div>
                )}

                <div className="flex items-center h-full px-2" onClick={(e) => { e.stopPropagation(); toggleSelect(store.id); }}>
                    <input
                        type="checkbox"
                        checked={selectedIds.has(store.id)}
                        onChange={() => { }}
                        className="w-4 h-4 rounded border-slate-300 pointer-events-none accent-[#0057B7]"
                    />
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden text-slate-300">
                    {store.images?.[0] ? (
                        <img src={store.images[0]} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <Image className="w-5 h-5" />
                    )}
                </div>
                <div className="min-w-0 max-w-[200px] md:max-w-[300px] lg:max-w-[400px]">
                    <p className="truncate text-[15px] font-semibold tracking-tight text-[#1E293B]">{store.name}</p>
                    <p className="truncate text-[13px] text-slate-500">{store.address || store.category}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {activeTab === "pending" && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(store); }} className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-[#EFF6FF] hover:text-[#0057B7]">
                            <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleApprove(store.id); }} className="rounded-full p-1.5 text-[#0057B7] transition-colors hover:bg-[#EFF6FF]">
                            <Check className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleReject(store.id); }} className="rounded-full p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600">
                            <X className="w-4.5 h-4.5" />
                        </button>
                    </>
                )}
                {activeTab === "trash" && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); handleRestore(store.id); }} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[14px] font-medium text-slate-600 transition-colors hover:border-[#0057B7]/30 hover:text-[#0057B7]">
                            <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handlePermanentDelete(store.id); }} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600">
                            <AlertTriangle className="w-3.5 h-3.5" /> Delete
                        </button>
                    </>
                )}
                {activeTab === "live" && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(store); }} className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-[#EFF6FF] hover:text-[#0057B7]">
                            <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleMoveToTrash(store.id, "approved"); }} className="rounded-full p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </>
                )}
                {activeTab === "drafts" && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteDraft(store.id); }} className="rounded-full p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleApprove(store.id); }} className="flex items-center gap-1.5 rounded-full bg-[#0057B7] px-3.5 py-1.5 text-[14px] font-medium tracking-tight text-white transition-colors hover:bg-[#0047A0]">
                            Publish
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

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
    const [isShortSidebarViewport, setIsShortSidebarViewport] = useState(false);

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

    useEffect(() => {
        const updateSidebarViewport = () => {
            setIsShortSidebarViewport(window.innerHeight < 980);
        };

        updateSidebarViewport();
        window.addEventListener("resize", updateSidebarViewport);

        return () => {
            window.removeEventListener("resize", updateSidebarViewport);
        };
    }, []);

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

    const refreshPublicStores = () =>
        queryClient.invalidateQueries({ queryKey: ["stores"], refetchType: "all" });

    // Mutations
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" | "pending" }) =>
            updateStoreStatus(id, status),
        onSuccess: () => {
            // EGRESS OPTIMIZATION: invalidate instead of refetch — only fetches when data is accessed
            queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
            void refreshPublicStores();
        },
    });

    const updateStoreMutation = useMutation({
        mutationFn: ({ id, updates }: {
            id: string;
            updates: {
                name?: string;
                address?: string;
                website?: string;
                category?: string;
                products?: string[];
                description?: string;
                city?: string;
                province?: string;
                latitude?: number | string;
                longitude?: number | string;
            }
        }) =>
            updateStore(id, updates),
        onSuccess: (data) => {
            // EGRESS OPTIMIZATION: invalidate instead of refetch
            queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
            void refreshPublicStores();
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
            // EGRESS OPTIMIZATION: invalidate instead of refetch
            queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
            void refreshPublicStores();
            toast({ title: "Images Updated", description: "Store images have been updated." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteStore(id),
        onSuccess: () => {
            // EGRESS OPTIMIZATION: invalidate instead of refetch
            queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
            void refreshPublicStores();
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

    // Get unique cities for filter
    const allCities = Array.from(new Set(allStores.map(s => s.address?.split(',').pop()?.trim()).filter(Boolean)));


    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [liveOrder, setLiveOrder] = useState<string[]>([]);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // 5px movement to start drag
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Sync liveOrder with fetched stores (initial only or when count changes)
    useEffect(() => {
        if (liveStores.length > 0) {
            // Only update if length differs or empty (to preserve manual sort during session)
            if (liveOrder.length !== liveStores.length) {
                setLiveOrder(liveStores.map(s => s.id));
            }
        }
    }, [liveStores.length]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setLiveOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over?.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
            // TODO: Persist order to backend if needed. Currently local.
        }
    };

    const getDisplayedStores = () => {
        let items: any[] = [];
        switch (activeTab) {
            case "pending": items = pendingStores; break;
            case "live":
                // Sort by liveOrder
                const orderMap = new Map(liveOrder.map((id, index) => [id, index]));
                items = [...liveStores].sort((a, b) => {
                    const idxA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
                    const idxB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
                    return idxA - idxB;
                });
                break;
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
        // Sort (Override manual sort if header sort is clicked)
        if (sortBy === "name") {
            items = [...items].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        } else if (sortBy === 'date' && activeTab !== 'live') {
            // Default date sort for non-live tabs
        }
        return items;
    };

    const displayedStores = getDisplayedStores();

    const parseCSV = (text: string) => {
        const lines = text.split('\n');
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const currentLine = [];
            let inQuotes = false;
            let start = 0;

            for (let j = 0; j < lines[i].length; j++) {
                if (lines[i][j] === '"') {
                    inQuotes = !inQuotes;
                } else if (lines[i][j] === ',' && !inQuotes) {
                    currentLine.push(lines[i].substring(start, j).replace(/^"|"$/g, '').trim());
                    start = j + 1;
                }
            }
            currentLine.push(lines[i].substring(start).replace(/^"|"$/g, '').trim());

            // Map based on order: Name, Address, Category (simple fallback)
            let [name, address, col3, col4, col5] = currentLine;

            // Heuristic to detect column mapping
            let category = col3;
            let website = col4;
            let description = col5;

            // Fix: If category looks like a URL, it's probably the website
            if (category && (category.startsWith('http') || category.startsWith('www'))) {
                website = category;
                category = 'food'; // Default fallback
            }

            // Fix: Normalize category
            const validCategories = ['food', 'clothes', 'retail', 'other'];
            if (!validCategories.includes(category?.toLowerCase() || '')) {
                category = 'food';
            }

            if (name) {
                result.push({
                    name,
                    address: address || '',
                    category: (category?.toLowerCase() || 'food') as any,
                    website: website || '',
                    description: description || ''
                });
            }
        }
        return result;
    }

    // Geocode helper using Photon (No more 1s delay!)
    async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; city?: string; province?: string } | null> {
        try {
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(address + ", Canada")}&limit=1`,
                { headers: { 'Accept': 'application/json' } }
            );
            if (!response.ok) throw new Error(`Geocoding HTTP ${response.status}`);

            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const f = data.features[0];
                const p = f.properties;
                return {
                    lat: f.geometry.coordinates[1],
                    lng: f.geometry.coordinates[0],
                    city: p.city || p.town || p.village || p.district || '',
                    province: p.state || '',
                };
            }
            return null;
        } catch (e) {
            console.error("Geocoding error:", e);
            return null;
        }
    }

    // Handlers
    const handleApprove = async (id: string) => {
        console.log("Approving Store ID:", id);

        // DRAFT PATH
        if (id.toString().startsWith('draft-')) {
            console.log("Draft ID detected. processing as draft...");
            const draftStore = drafts.find(d => d.id === id);

            if (!draftStore) {
                console.error("Draft store not found in state:", id);
                toast({ title: "Error", description: "Draft data missing. Please re-import.", variant: "destructive" });
                return;
            }

            try {
                // Validate/Fix data before sending
                const validDescription = (draftStore.description && draftStore.description.length >= 10)
                    ? draftStore.description
                    : "A great place to find Ukrainian products and support the community.";

                const validProducts = (draftStore.products && draftStore.products.length > 0)
                    ? draftStore.products
                    : ["General Goods", "Ukrainian Products"];

                const validCategory = ['food', 'clothes', 'retail', 'other'].includes(draftStore.category)
                    ? draftStore.category
                    : 'food';

                // Fix website if it's invalid (basic check)
                let validWebsite = draftStore.website || '';
                if (validWebsite && !validWebsite.startsWith('http')) {
                    validWebsite = 'https://' + validWebsite;
                }

                let city = draftStore.city || draftStore.address.split(',').pop()?.trim() || 'Toronto';
                let province = draftStore.province || 'ON';

                toast({ title: "Geocoding...", description: "Looking up address coordinates." });
                const addressToGeocode = draftStore.address.replace(/, Canada$/i, "").trim(); // Remove ", Canada" suffix if present

                let geo = await geocodeAddress(addressToGeocode);

                // Fallback: Try geocoding without postal code if first attempt fails
                if (!geo) {
                    const noPostal = addressToGeocode.replace(/[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/, "").trim();
                    if (noPostal !== addressToGeocode) {
                        console.log("Retrying geocode without postal code:", noPostal);
                        geo = await geocodeAddress(noPostal);
                    }
                }

                if (!geo) {
                    console.warn("Geocoding failed, keeping draft unpublished.");
                    toast({
                        title: "Geocoding failed",
                        description: "Draft was not published. Please verify the address before approving.",
                        variant: "destructive"
                    });
                    return;
                }

                const lat = geo.lat;
                const lng = geo.lng;
                city = geo.city || city;
                province = geo.province || province;
                console.log("Geocoded to:", lat, lng);

                const payload = {
                    name: draftStore.name,
                    description: validDescription,
                    products: validProducts,
                    address: draftStore.address,
                    city: city,
                    province: province,
                    latitude: lat,
                    longitude: lng,
                    category: validCategory,
                    website: validWebsite,
                    images: draftStore.images
                };

                console.log("Creating store from draft with payload:", payload);
                await createStore(payload);

                // Remove from drafts
                setDrafts(prev => prev.filter(d => d.id !== id));
                queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
                void refreshPublicStores();
                toast({ title: "Draft Published", description: "Store created successfully." });
            } catch (e: any) {
                console.error("Draft creation failed:", e);
                toast({ title: "Error", description: e.message || "Failed to publish draft", variant: "destructive" });
            }
            return;
        }

        // EXISTING STORE PATH
        const store = allStores.find(s => s.id === id);
        if (!store) {
            console.error("Store not found:", id);
            toast({ title: "Error", description: "Store data not found.", variant: "destructive" });
            return;
        }

        try {
            console.log("Updating status for existing store...");
            await updateStatusMutation.mutateAsync({ id, status: "approved" });
            void refreshPublicStores();
            toast({ title: "Store Approved ✓", description: "The store is now live on the map!" });
        } catch (e) {
            console.error("Status update failed:", e);
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
        // Check if draft
        const isDraft = drafts.some(d => d.id === id) || id.toString().startsWith('draft-');
        if (isDraft) {
            handleDeleteDraft(id);
            return;
        }
        handleMoveToTrash(id, "pending");
    };

    // Handle deleting a draft locally
    const handleDeleteDraft = (id: string) => {
        setDrafts(prev => prev.filter(d => d.id !== id));
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        toast({ title: "Draft Removed", description: "Draft deleted from list." });
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

    // Bulk Actions
    const toggleSelectAll = () => {
        if (selectedIds.size === displayedStores.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayedStores.map(s => s.id)));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const performBulkDelete = async () => {
        setIsBulkProcessing(true);
        const ids = Array.from(selectedIds);
        const previousDrafts = [...drafts];
        const itemsToRestore: { id: string, status: "pending" | "approved" | "rejected" }[] = [];

        // Optimistic UI Update: Clear selection immediately
        setSelectedIds(new Set());

        try {
            if (activeTab === 'drafts') {
                // Filter out deleted drafts immediately
                setDrafts(prev => prev.filter(d => !ids.includes(d.id)));
                toast({
                    title: "Drafts Deleted",
                    description: `Removed ${ids.length} drafts.`,
                    action: <ToastAction altText="Undo" onClick={() => setDrafts(previousDrafts)}>Undo</ToastAction>
                });
            } else if (activeTab === 'trash') {
                // Permanent Delete - Parallel Execution
                await Promise.all(ids.map(id => deleteMutation.mutateAsync(id)));
                toast({ title: "Deleted Permanently", description: `Removed ${ids.length} items.` });
            } else {
                // Move to Trash (Reject) - Parallel Execution
                // Save current status for undo? (Assuming they are all 'pending' or 'approved' based on tab)
                const currentStatus = activeTab as "pending" | "approved";

                await Promise.all(ids.map(id => updateStatusMutation.mutateAsync({ id, status: "rejected" })));

                toast({
                    title: "Moved to Trash",
                    description: `Moved ${ids.length} items to trash.`,
                    action: (
                        <ToastAction altText="Undo" onClick={async () => {
                            const undoPromises = ids.map(id => updateStatusMutation.mutateAsync({ id, status: currentStatus }));
                            await Promise.all(undoPromises);
                            toast({ title: "Undone", description: "Items restored." });
                        }}>
                            Undo
                        </ToastAction>
                    )
                });
            }
        } catch (e) {
            console.error("Bulk delete failed:", e);
            // Revert selection on critical failure if needed, or just let error toast show
            toast({ title: "Error", description: "Some items failed to delete.", variant: "destructive" });
        } finally {
            setIsBulkProcessing(false);
            setShowBulkDeleteConfirm(false);
        }
    };

    const handleBulkDelete = () => {
        setShowBulkDeleteConfirm(true);
    };

    const handleBulkApprove = async () => {
        setIsBulkProcessing(true);
        const ids = Array.from(selectedIds);
        let count = 0;

        // Clear selection immediately to prevent double-clicks
        setSelectedIds(new Set());

        toast({ title: "Processing...", description: `Approving ${ids.length} items. Please wait.` });

        try {
            // Sequential for now due to geocoding rate limits, but UI won't flicker as much
            // We could parallelize non-draft approvals since they don't need geocoding
            for (const id of ids) {
                // Identify if draft or existing
                if (id.startsWith('draft-')) {
                    await handleApprove(id); // Using existing logic with geocoding
                } else {
                    await updateStatusMutation.mutateAsync({ id, status: "approved" });
                }
                count++;
            }
            toast({ title: "Bulk Action Complete", description: `Approved ${count} items.` });
        } catch (e) {
            console.error("Bulk approve error:", e);
            toast({ title: "Error", description: "Failed to approve all items.", variant: "destructive" });
        } finally {
            setIsBulkProcessing(false);
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
            const addressChanged = editAddress.trim() !== selectedStore.address.trim();

            let nextCity = selectedStore.city;
            let nextProvince = selectedStore.province;
            let nextLatitude = selectedStore.coordinates?.[0];
            let nextLongitude = selectedStore.coordinates?.[1];

            if (addressChanged) {
                toast({ title: "Updating map location...", description: "Looking up fresh coordinates for this address." });

                const addressToGeocode = editAddress.replace(/, Canada$/i, "").trim();
                let geo = await geocodeAddress(addressToGeocode);

                if (!geo) {
                    const noPostal = addressToGeocode.replace(/[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/, "").trim();
                    if (noPostal !== addressToGeocode) {
                        geo = await geocodeAddress(noPostal);
                    }
                }

                if (!geo) {
                    toast({
                        title: "Location update failed",
                        description: "The address could not be geocoded, so the store was not saved. This prevents bad map pins.",
                        variant: "destructive"
                    });
                    return;
                }

                nextCity = geo.city || nextCity;
                nextProvince = geo.province || nextProvince;
                nextLatitude = geo.lat;
                nextLongitude = geo.lng;
            }

            await updateStoreMutation.mutateAsync({
                id: selectedStore.id,
                updates: {
                    name: editName,
                    address: editAddress,
                    website: editWebsite,
                    category: editCategory,
                    products: productsArray,
                    description: editDescription,
                    city: nextCity,
                    province: nextProvince,
                    latitude: nextLatitude,
                    longitude: nextLongitude,
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

    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const currentTotal = editImages.length + localImagePreviews.length;
        const remaining = 3 - currentTotal;
        const validFiles = Array.from(files).slice(0, remaining);

        for (const file of validFiles) {
            try {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 800,
                    useWebWorker: true,
                    fileType: "image/webp" as const,
                    initialQuality: 0.8
                };

                // Compress
                const compressedFile = await imageCompression(file, options);

                // Read
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    if (result) {
                        setLocalImagePreviews((prev) => {
                            // Re-check capacity in case of race conditions
                            if (prev.length + editImages.length >= 3) return prev;
                            return [...prev, result];
                        });
                    }
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error("Image compression failed, using original:", error);
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    if (result) {
                        setLocalImagePreviews((prev) => {
                            if (prev.length + editImages.length >= 3) return prev;
                            return [...prev, result];
                        });
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    }, [editImages.length]);

    // Bulk Import Handler
    const handleBulkImport = useCallback((files: FileList) => {
        const file = files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            // Use new robust CSV parser
            const parsedData = parseCSV(text);

            const newDrafts = parsedData.map((data, index) => {
                return {
                    id: `draft-${Date.now()}-${index}`,
                    name: data.name || 'Unknown Store',
                    address: data.address || '',
                    category: data.category || 'food',
                    website: data.website,
                    status: 'draft',
                    products: [],
                    description: data.description,
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
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-[#1E293B]">
            {/* Left Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-[120] flex h-screen w-[248px] flex-col border-r border-slate-200 bg-white px-4 pt-[28px]" style={{ fontSize: '16px' }}>
                <div className="shrink-0 pb-[38px]">
                    <Link href="/" className="block px-2">
                        <SiteBrandLockup className={cn("origin-left", isShortSidebarViewport ? "scale-[0.96]" : "scale-[0.98]")} />
                    </Link>
                </div>

                <nav className="min-h-0 flex-1 overflow-y-auto pb-2">
                    <p className={adminSectionLabelClassName}>Moderation</p>
                    <ul className="space-y-2">
                        {tabs.map((tab) => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => { setActiveTab(tab.id); setSelectedIds(new Set()); }}
                                    className={cn(
                                        "flex w-full items-center gap-4 rounded-[12px] px-4 py-3 text-left text-[14.5px] font-medium transition-all duration-300",
                                        activeTab === tab.id
                                            ? "bg-[#0057B7]/60 text-white font-semibold shadow-sm"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <tab.icon className="h-[18px] w-[18px] shrink-0" />
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span
                                            className={cn(
                                                "ml-auto min-w-[20px] rounded-full px-2 py-0.5 text-center text-[11px] font-bold",
                                                tab.id === "pending"
                                                    ? "bg-[#FFD700] text-[#1E293B]"
                                                    : "bg-[#0057B7] text-white"
                                            )}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-3.5">
                        <p className={adminSectionLabelClassName}>Stats</p>
                        <div className="space-y-2 px-2">
                            <div className="flex items-center justify-between rounded-[12px] border border-slate-200 bg-[#F8FAFC] px-3 py-1.5">
                                <span className="text-[13px] whitespace-nowrap text-slate-500">Total Stores</span>
                                <span className="text-[15px] font-semibold text-[#1E293B]">{allStores.length}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-[12px] border border-slate-200 bg-[#F8FAFC] px-3 py-1.5">
                                <span className="text-[13px] whitespace-nowrap text-slate-500">Team Members</span>
                                <span className="text-[15px] font-semibold text-[#1E293B]">{adminUsers.length || 1}</span>
                            </div>
                        </div>
                    </div>

                    {!isShortSidebarViewport && (
                        <div className="mt-4">
                            <div className="mb-2 flex items-center justify-between px-2">
                                <p className={adminSectionLabelClassName}>Traffic Pulse</p>
                                <TrendingUp className="h-4 w-4 text-slate-300" />
                            </div>
                            <div className="rounded-[14px] border border-slate-200 bg-[#F8FAFC] p-2">
                                <div className="flex h-6 items-end gap-px rounded-lg bg-white px-2 pb-1">
                                    {[30, 45, 25, 60, 80, 55, 70, 90, 65, 75, 85, 95].map((h, i) => (
                                        <div key={i} className="flex-1 rounded-t-sm bg-slate-300" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <p className="mt-1 text-[9px] text-slate-400">Last 30 days</p>
                            </div>
                        </div>
                    )}
                </nav>

                <div className="shrink-0 border-t border-slate-200 py-2">
                    <div className="flex items-center gap-3 px-2 py-1.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC]">
                            <Users className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold text-[#1E293B]">Admin User</p>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 text-[13px] font-medium text-slate-400 transition-colors hover:text-slate-600"
                            >
                                <LogOut className="w-3 h-3" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="relative ml-[248px] h-screen flex-1 overflow-y-auto bg-[#F8FAFC] scroll-smooth">
                <div className="sticky top-0 z-[100] flex items-center justify-between border-b border-slate-200 bg-white/90 px-16 py-8 backdrop-blur-xl transition-all duration-500">
                    <div>
                        <h2 className="text-[24px] font-semibold tracking-tight text-[#1E293B]">
                            {activeTab === "pending" ? "Moderation Queue" :
                                activeTab === "live" ? "Live Stores" :
                                    activeTab === "trash" ? "Trash" :
                                        activeTab === "settings" ? "Settings" : "Draft Queue"}
                        </h2>
                        <p className="mt-1 text-[14px] text-slate-400">
                            {activeTab === "pending" ? "Hi, admin" :
                                activeTab === "live" ? "Manage live store listings" :
                                    activeTab === "trash" ? "Restore or permanently delete stores" :
                                        activeTab === "settings" ? "Manage admin users and passwords" : "Import and review bulk uploads"}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => bulkInputRef.current?.click()}
                            className="flex h-[40px] items-center gap-2 rounded-full bg-[#0057B7] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#0047A0]"
                        >
                            <Upload className="w-4 h-4" /> Bulk Import
                        </button>
                        <input
                            type="file"
                            ref={bulkInputRef}
                            onChange={(e) => e.target.files && handleBulkImport(e.target.files)}
                            accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            className="hidden"
                        />
                        <a
                            href="/"
                            target="_blank"
                            className="flex items-center gap-2 text-[14px] text-slate-500 transition-colors hover:text-[#0057B7]"
                        >
                            View Site <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
                {/* Content Area */}
                <div className="px-16 py-12 pb-32 space-y-12">

                    {/* Filter Bar */}
                    {activeTab !== "settings" && (
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                            {/* Bulk Selection Header if items exist */}
                            {displayedStores.length > 0 && (
                                <div className="mr-4 flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === displayedStores.length && displayedStores.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 accent-[#0057B7]"
                                    />
                                    <span className="ml-2 text-sm text-slate-500">Select All</span>
                                </div>
                            )}

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
                                            "rounded-full px-4 py-2 text-[14px] font-medium transition-colors",
                                            categoryFilter === cat.id
                                                ? "bg-[#0057B7]/60 text-white font-semibold"
                                                : "border border-slate-200 bg-white text-slate-500 hover:border-[#0057B7]/30 hover:text-[#0057B7]"
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
                                className="h-[40px] w-[180px] rounded-full border border-slate-200 bg-white px-4 text-[13px] text-[#1E293B] outline-none transition-colors placeholder:text-slate-400 focus:border-[#0057B7]/30"
                            />
                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as "date" | "name")}
                                className="h-[40px] rounded-full border border-slate-200 bg-white px-4 text-[13px] text-[#1E293B] outline-none transition-colors focus:border-[#0057B7]/30"
                            >
                                <option value="date">Sort: Date Added</option>
                                <option value="name">Sort: Name</option>
                            </select>
                        </div>
                    )}

                    {/* Bulk Actions Bar */}
                    {selectedIds.size > 0 && (
                        <div className="fixed bottom-8 left-[calc(248px+64px)] right-16 z-50 flex items-center justify-between rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-6">
                            <span className="pl-2 text-sm font-medium text-[#1E293B]">{selectedIds.size} items selected</span>
                            <div className="flex items-center gap-3">
                                <Button
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    disabled={isBulkProcessing}
                                    className="rounded-full border-0 bg-transparent px-4 text-[14px] font-medium text-red-400 shadow-none transition-colors hover:bg-red-50 hover:text-red-600"
                                >
                                    {isBulkProcessing ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 mr-2" />
                                    )}
                                    {activeTab === "trash" ? "Delete Selected" : "Delete Selected"}
                                </Button>
                                {(activeTab === "pending" || activeTab === "drafts") && (
                                    <Button
                                        size="sm"
                                        className="h-[40px] rounded-full bg-[#0057B7] px-5 text-[14px] font-medium text-white shadow-none transition-colors hover:bg-[#0047A0]"
                                        onClick={handleBulkApprove}
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        {activeTab === "drafts" ? "Publish Selected" : "Approve Selected"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bulk Import Drop Zone (visible on Drafts tab) */}
                    {activeTab === "drafts" && (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                "mb-8 rounded-[20px] border-2 border-dashed p-8 text-center transition-all",
                                isDragOver ? "border-[#0057B7]/30 bg-[#EFF6FF]/40" : "border-slate-200 bg-white"
                            )}
                        >
                            <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                            <p className="mb-2 text-[16px] font-medium text-[#1E293B]">Drop CSV or Excel file here</p>
                            <p className="text-[13px] text-slate-400">Format: Store Name, Address, Category</p>
                        </div>
                    )}

                    {/* Store Grid/List */}
                    {activeTab !== "settings" && (
                        <>
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse rounded-[20px] border border-slate-200 bg-white p-6">
                                            <div className="mb-4 h-32 rounded-xl bg-slate-100"></div>
                                            <div className="mb-2 h-4 w-3/4 rounded bg-slate-100"></div>
                                            <div className="h-3 w-1/2 rounded bg-slate-100"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : displayedStores.length === 0 ? (
                                <div className="rounded-[20px] border border-slate-200 bg-white py-24 text-center">
                                    {activeTab === "drafts" ? <FileSpreadsheet className="mx-auto mb-4 h-16 w-16 text-slate-200" /> :
                                        activeTab === "trash" ? <Trash2 className="mx-auto mb-4 h-16 w-16 text-slate-200" /> :
                                            <FileText className="mx-auto mb-4 h-16 w-16 text-slate-200" />}
                                    <p className="text-lg text-slate-400">
                                        {activeTab === "pending" ? "No pending submissions" :
                                            activeTab === "live" ? "No live stores yet" :
                                                activeTab === "trash" ? "Trash is empty" : "No drafts yet"}
                                    </p>
                                </div>
                            ) : viewMode === "list" ? (
                                <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
                                    <div>
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={displayedStores.map((s: any) => s.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {displayedStores.map((store: any) => (
                                                    <SortableStoreRow
                                                        key={store.id}
                                                        store={store}
                                                        selectedIds={selectedIds}
                                                        activeTab={activeTab}
                                                        toggleSelect={toggleSelect}
                                                        openEditModal={openEditModal}
                                                        handleApprove={handleApprove}
                                                        handleReject={handleReject}
                                                        handleRestore={handleRestore}
                                                        handlePermanentDelete={handlePermanentDelete}
                                                        handleMoveToTrash={handleMoveToTrash}
                                                        handleDeleteDraft={handleDeleteDraft}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                    <div className="border-t border-slate-200 bg-[#F8FAFC] px-5 py-3 text-[12px] text-slate-500">
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
                                            showActions={activeTab === "pending" || activeTab === "drafts"}
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
                        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
                            <div className="flex items-center justify-between border-b border-slate-200 p-5">
                                <h3 className="text-lg font-semibold tracking-tight text-[#1E293B]">Admin Users</h3>
                                <Button onClick={() => setIsNewUserModalOpen(true)} className={cn(adminPrimaryButtonClassName, "gap-2")}>
                                    <Plus className="w-4 h-4" /> Add User
                                </Button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {adminUsers.map((user: AdminUser) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 transition-colors hover:bg-[#EFF6FF]/40">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FAFC]">
                                                <User className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#1E293B]">{user.username}</p>
                                                <p className="text-xs text-slate-400">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                className={cn(adminPrimaryButtonClassName, "gap-2")}
                                                size="sm"
                                                onClick={() => {
                                                    setTargetUserId(user.id);
                                                    setNewPassword("");
                                                    setConfirmPassword("");
                                                    setIsPasswordModalOpen(true);
                                                }}
                                            >
                                                <Key className="w-4 h-4" /> Change Password
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm("Delete this user?")) deleteUserMutation.mutate(user.id);
                                                }}
                                                className="h-[46px] rounded-full bg-transparent px-4 text-red-400 shadow-none transition-colors hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="w-full max-w-[520px] rounded-[24px] border-white bg-white p-8 shadow-[0_32px_64px_rgba(0,0,0,0.12)]">
                    <DialogHeader>
                        <DialogTitle className="mb-6 text-[20px] font-semibold tracking-tight text-[#0057B7]">Edit store</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label htmlFor="editName" className={adminFieldLabelClassName}>Store Name</Label>
                            <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter store name" className={adminInputClassName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editAddress" className={adminFieldLabelClassName}>Address</Label>
                            <Input id="editAddress" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Enter store address" className={adminInputClassName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editWebsite" className={adminFieldLabelClassName}>Website</Label>
                            <Input id="editWebsite" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="https://example.com" className={adminInputClassName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editCategory" className={adminFieldLabelClassName}>Category</Label>
                            <select
                                id="editCategory"
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value as any)}
                                className={cn("w-full outline-none", adminInputClassName)}
                            >
                                <option value="food">Food & Grocery</option>
                                <option value="clothes">Clothing & Apparel</option>
                                <option value="retail">Retail & Gifts</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editProducts" className={adminFieldLabelClassName}>Products Sold</Label>
                            <Input id="editProducts" value={editProducts} onChange={(e) => setEditProducts(e.target.value)} placeholder="Pierogies, Bread, Sausages..." className={adminInputClassName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editDescription" className={adminFieldLabelClassName}>Description</Label>
                            <textarea
                                id="editDescription"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="What makes this store special..."
                                className={cn("w-full outline-none", adminTextareaClassName)}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className={adminFieldLabelClassName}>Images (max 3)</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {editImages.map((url, index) => (
                                    <div key={`url-${index}`} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(index, false)}
                                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {localImagePreviews.map((url, index) => (
                                    <div key={`local-${index}`} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group">
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute top-1 left-1 rounded bg-[#0057B7] px-1.5 py-0.5 text-[10px] font-medium text-white">NEW</div>
                                        <button
                                            onClick={() => removeImage(index, true)}
                                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {editImages.length + localImagePreviews.length < 3 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white text-slate-400 transition-colors hover:border-[#0057B7]/30 hover:bg-[#EFF6FF]/30 hover:text-[#0057B7]"
                                    >
                                        <Upload className="w-6 h-6 mb-1" />
                                        <span className="text-[11px] font-medium">Upload</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" multiple className="hidden" />
                        </div>
                    </div>
                    <DialogFooter className="w-full items-center justify-between border-t border-slate-100 pt-6 sm:justify-between">
                        <Button
                            variant="ghost"
                            className="gap-1.5 bg-transparent px-0 text-[14px] font-medium text-red-400 shadow-none transition-colors hover:bg-transparent hover:text-red-600"
                            onClick={() => {
                                if (selectedStore) {
                                    handleMoveToTrash(selectedStore.id, "approved");
                                    setIsEditModalOpen(false);
                                }
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={handleResetChanges}
                                className="h-[46px] rounded-full bg-transparent px-0 text-[14px] font-medium text-slate-400 shadow-none transition-colors hover:bg-transparent hover:text-slate-600"
                            >
                                Undo Save
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                className={cn(adminPrimaryButtonClassName, "px-8")}
                            >
                                Save changes
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Change Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="rounded-[24px] border-white bg-white p-8 shadow-[0_32px_64px_rgba(0,0,0,0.12)]">
                    <DialogHeader>
                        <DialogTitle className="text-[20px] font-semibold tracking-tight text-[#0057B7]">Change password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPass" className={adminFieldLabelClassName}>New Password</Label>
                            <Input
                                id="newPass"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={adminInputClassName}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPass" className={adminFieldLabelClassName}>Confirm Password</Label>
                            <Input
                                id="confirmPass"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={adminInputClassName}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full border-slate-200 px-6 text-[14px] font-medium text-slate-500" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                        <Button className={adminPrimaryButtonClassName} onClick={handlePasswordUpdate}>Update password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New User Modal */}
            <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
                <DialogContent className="rounded-[24px] border-white bg-white p-8 shadow-[0_32px_64px_rgba(0,0,0,0.12)]">
                    <DialogHeader>
                        <DialogTitle className="text-[20px] font-semibold tracking-tight text-[#0057B7]">Create new admin user</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="newUsername" className={adminFieldLabelClassName}>Username</Label>
                            <Input
                                id="newUsername"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className={adminInputClassName}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newUserPass" className={adminFieldLabelClassName}>Password</Label>
                            <Input
                                id="newUserPass"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={adminInputClassName}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full border-slate-200 px-6 text-[14px] font-medium text-slate-500" onClick={() => setIsNewUserModalOpen(false)}>Cancel</Button>
                        <Button className={adminPrimaryButtonClassName} onClick={handleCreateUser}>Create user</Button>
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
                                            <Button className={cn(adminPrimaryButtonClassName, "h-12")} onClick={() => { handleApprove(storeToView.id); setStoreToView(null); }}>
                                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button variant="outline" className="h-12 rounded-full border-red-200 bg-white text-red-400 hover:bg-red-50 hover:text-red-600" onClick={() => { handleReject(storeToView.id); setStoreToView(null); }}>
                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    )}
                                    {activeTab === "live" && (
                                        <Button className={cn(adminPrimaryButtonClassName, "h-12 w-full")} onClick={() => { openEditModal(storeToView); setStoreToView(null); }}>
                                            Edit Details
                                        </Button>
                                    )}
                                    {activeTab === "trash" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button className="h-12 rounded-full border-slate-200 text-slate-600 hover:border-[#0057B7]/30 hover:text-[#0057B7]" variant="outline" onClick={() => { handleRestore(storeToView.id); setStoreToView(null); }}>
                                                <RotateCcw className="w-4 h-4 mr-2" /> Restore
                                            </Button>
                                            <Button className="h-12 rounded-full border-red-200 bg-white text-red-400 hover:bg-red-50 hover:text-red-600" variant="outline" onClick={() => { handlePermanentDelete(storeToView.id); setStoreToView(null); }}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </Button>
                                        </div>
                                    )}
                                    {activeTab === "drafts" && (
                                        <Button className={cn(adminPrimaryButtonClassName, "h-12 w-full")} onClick={() => { handleApprove(storeToView.id); setStoreToView(null); }}>
                                            Publish
                                        </Button>
                                    )}
                                </div>
                            }
                        />
                    )}
                </DialogContent>
            </Dialog>
            {/* Bulk Delete Confirmation Dialog */}
            <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
                <DialogContent className="rounded-[24px] border-white bg-white p-8 shadow-[0_32px_64px_rgba(0,0,0,0.12)]">
                    <DialogHeader>
                        <DialogTitle className="text-[20px] font-semibold tracking-tight text-[#0057B7]">Confirm bulk action</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-slate-500">
                            {activeTab === 'trash'
                                ? `Are you sure you want to PERMANENTLY delete these ${selectedIds.size} items? This cannot be undone.`
                                : `Are you sure you want to move ${selectedIds.size} items to trash?`
                            }
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-full border-slate-200 px-6 text-[14px] font-medium text-slate-500" onClick={() => setShowBulkDeleteConfirm(false)}>Cancel</Button>
                        <Button
                            variant="outline"
                            onClick={performBulkDelete}
                            disabled={isBulkProcessing}
                            className="rounded-full border-red-200 bg-white px-6 text-[14px] font-medium text-red-400 hover:bg-red-50 hover:text-red-600"
                        >
                            {isBulkProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {activeTab === 'trash' ? "Permanently Delete" : "Move to Trash"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
