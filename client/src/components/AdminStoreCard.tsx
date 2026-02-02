import { Store } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
    Check,
    X,
    Edit3,
    Image as ImageIcon,
    ChevronRight,
} from "lucide-react";

interface AdminStoreCardProps {
    store: Store;
    viewMode: "list" | "grid";
    showActions: boolean; // true for pending, false for approved
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onEdit: (store: Store) => void;
    onView?: (store: Store) => void;
}

// Shared branded circle component
function BrandCircle({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-full shrink-0 border border-white shadow-sm`}
            style={{ background: 'linear-gradient(to bottom, #3C93EA 50%, #F3FF0A 50%)' }}
        />
    );
}

// Status badge component
function StatusBadge({ status, variant = "default" }: { status: string; variant?: "default" | "rounded" }) {
    const baseClasses = variant === "rounded"
        ? "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
        : "px-2 py-1 rounded-lg text-[11px] font-bold uppercase";

    const colorClasses = status === "pending"
        ? "bg-orange-100 text-orange-700"
        : status === "approved"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700";

    return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
}

// List View Row
function ListViewRow({
    store,
    showActions,
    onApprove,
    onReject,
    onEdit,
    onView,
}: Omit<AdminStoreCardProps, "viewMode">) {
    return (
        <div
            className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors group cursor-pointer"
            onClick={() => onView?.(store)}
        >
            {/* Blue/Yellow Circle */}
            <BrandCircle size="md" />

            {/* Store Name */}
            <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-medium text-admin-text truncate">{store.name}</h3>
                <p className="text-[12px] text-gray-400 truncate">{store.address}</p>
            </div>

            {/* Category Badge */}
            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 uppercase font-medium hidden md:inline">
                {store.category}
            </span>

            {/* Status Badge */}
            <StatusBadge status={store.status} variant="rounded" />

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                {showActions && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onApprove(store.id); }}
                            className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                            title="Approve"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onReject(store.id); }}
                            className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                            title="Reject"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(store); }}
                    className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-brand-blue-logo transition-colors"
                    title="Edit"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
        </div>
    );
}

// Grid View Card
function GridViewCard({
    store,
    showActions,
    onApprove,
    onReject,
    onEdit,
    onView,
}: Omit<AdminStoreCardProps, "viewMode">) {
    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer"
            onClick={() => onView?.(store)}
        >
            {/* Image */}
            <div className="relative h-36 bg-gray-50">
                {store.images && store.images.length > 0 ? (
                    <img
                        src={store.images[0]}
                        alt={store.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BrandCircle size="lg" />
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <StatusBadge status={store.status} />
                </div>

                {/* Quick Edit Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(store); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:bg-white hover:text-brand-blue-logo transition-all opacity-0 group-hover:opacity-100"
                >
                    <Edit3 className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-[16px] font-semibold text-admin-text mb-1 truncate">{store.name}</h3>
                <p className="text-[13px] text-gray-400 truncate mb-1">{store.address}</p>
                <span className="inline-block text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase font-medium">
                    {store.category}
                </span>

                {/* Image Count */}
                <div className="flex items-center gap-1 mt-3 text-[12px] text-gray-400">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {(store.images?.length || 0)}/3 images
                </div>
            </div>

            {/* Action Buttons */}
            {showActions && (
                <div className="px-5 pb-5 flex gap-2">
                    <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => { e.stopPropagation(); onApprove(store.id); }}
                    >
                        <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={(e) => { e.stopPropagation(); onReject(store.id); }}
                    >
                        <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                </div>
            )}

            {!showActions && (
                <div className="px-5 pb-5">
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => { e.stopPropagation(); onEdit(store); }}
                    >
                        <Edit3 className="w-4 h-4 mr-2" /> Edit Details
                    </Button>
                </div>
            )}
        </div>
    );
}

// Main exported component - switches between List and Grid
export function AdminStoreCard(props: AdminStoreCardProps) {
    if (props.viewMode === "list") {
        return <ListViewRow {...props} />;
    }
    return <GridViewCard {...props} />;
}

// Export subcomponents for flexibility
export { BrandCircle, StatusBadge };
