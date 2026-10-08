import { Store } from "@/lib/data";
import {
    Check,
    ChevronRight,
    Edit3,
    Image as ImageIcon,
    MapPin,
    X,
} from "lucide-react";

interface AdminStoreCardProps {
    store: Store;
    viewMode: "list" | "grid";
    showActions: boolean;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onEdit: (store: Store) => void;
    onView?: (store: Store) => void;
}

const categoryLabels: Record<string, string> = {
    food: "Food & Grocery",
    clothes: "Clothing",
    retail: "Retail & Gifts",
    other: "Gifts",
};

function BrandCircle({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "h-7 w-7",
        md: "h-10 w-10",
        lg: "h-14 w-14",
    };

    return (
        <div
            aria-hidden="true"
            className={`${sizeClasses[size]} shrink-0 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,87,183,0.2)]`}
            style={{ background: "linear-gradient(to bottom, #0057B7 50%, #FFD700 50%)" }}
        />
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = status === "pending"
        ? "border-[#f4d6a6] bg-[#fff8eb] text-[#9a5b00]"
        : status === "approved"
            ? "border-[#bde5d1] bg-[#f0fbf5] text-[#197044]"
            : "border-[#f1c6c6] bg-[#fff4f4] text-[#ae3c3c]";

    return (
        <span className={`inline-flex min-h-6 items-center gap-1.5 rounded-none border px-2.5 text-[10px] font-extrabold uppercase tracking-[0.08em] ${styles}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}

function ActionButton({
    label,
    tone,
    onClick,
    children,
}: {
    label: string;
    tone: "approve" | "reject" | "edit";
    onClick: () => void;
    children: React.ReactNode;
}) {
    const toneClasses = tone === "approve"
        ? "border-[#bde5d1] bg-[#f0fbf5] text-[#197044] hover:bg-[#e2f7eb]"
        : tone === "reject"
            ? "border-[#f1c6c6] bg-white text-[#ae3c3c] hover:bg-[#fff4f4]"
            : "border-[#dbe7f3] bg-white text-[#567089] hover:border-[#9cc1e5] hover:text-[#0057B7]";

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={(event) => {
                event.stopPropagation();
                onClick();
            }}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-none border transition-colors ${toneClasses}`}
        >
            {children}
        </button>
    );
}

function StoreMeta({ store }: { store: Store }) {
    return (
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#71869b]">
            <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8da7bf]" />
                <span className="truncate">{store.address || "Address pending"}</span>
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-[#b6c8d9] sm:block" />
            <span>{categoryLabels[store.category] || "Gifts"}</span>
        </div>
    );
}

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
            className="group grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e6eef6] px-4 py-4 transition-colors last:border-b-0 hover:bg-[#f8fbff] sm:gap-4 sm:px-5"
            onClick={() => onView?.(store)}
        >
            <div className="relative">
                {store.images?.[0] ? (
                    <img src={store.images[0]} alt="" className="h-11 w-11 rounded-none object-cover ring-1 ring-[#dbe7f3]" />
                ) : (
                    <BrandCircle />
                )}
            </div>

            <div className="min-w-0">
                <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
                    <h3 className="truncate text-[14px] font-bold tracking-[-0.01em] text-[#102a43] sm:text-[15px]">{store.name}</h3>
                    <StatusBadge status={store.status} />
                    {store.deletionRequestedAt && (
                        <span className="inline-flex items-center rounded-none border border-[#f1c6c6] bg-[#fff4f4] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ae3c3c]">
                            Deletion Requested ({store.deletionRequestEmail || "No Email"})
                        </span>
                    )}
                </div>
                <StoreMeta store={store} />
                <p className="mt-1 truncate text-[11px] text-[#9aabbb]">
                    {store.products?.length ? store.products.slice(0, 3).join(" · ") : "No products listed"}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
                {showActions && (
                    <>
                        <ActionButton label={`Approve ${store.name}`} tone="approve" onClick={() => onApprove(store.id)}>
                            <Check className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton label={`Reject ${store.name}`} tone="reject" onClick={() => onReject(store.id)}>
                            <X className="h-4 w-4" />
                        </ActionButton>
                    </>
                )}
                <ActionButton label={`Edit ${store.name}`} tone="edit" onClick={() => onEdit(store)}>
                    <Edit3 className="h-4 w-4" />
                </ActionButton>
                <ChevronRight className="ml-1 hidden h-4 w-4 text-[#b4c7d8] transition-transform group-hover:translate-x-0.5 sm:block" />
            </div>
        </div>
    );
}

function GridViewCard({
    store,
    showActions,
    onApprove,
    onReject,
    onEdit,
    onView,
}: Omit<AdminStoreCardProps, "viewMode">) {
    return (
        <article
            className="group overflow-hidden rounded-[18px] border border-[#dbe7f3] bg-white shadow-[0_12px_26px_rgba(21,75,128,0.05)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(21,75,128,0.1)]"
            onClick={() => onView?.(store)}
        >
            <div className="relative h-36 overflow-hidden bg-[#f3f8fd]">
                {store.images?.[0] ? (
                    <img src={store.images[0]} alt={store.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                ) : (
                    <div className="flex h-full items-center justify-center"><BrandCircle size="lg" /></div>
                )}
                <div className="absolute left-3 top-3"><StatusBadge status={store.status} /></div>
                <div className="absolute right-3 top-3">
                    <ActionButton label={`Edit ${store.name}`} tone="edit" onClick={() => onEdit(store)}>
                        <Edit3 className="h-4 w-4" />
                    </ActionButton>
                </div>
            </div>
            <div className="space-y-3 p-5">
                <div>
                    <h3 className="truncate text-[16px] font-bold tracking-[-0.02em] text-[#102a43]">{store.name}</h3>
                    <p className="mt-1 truncate text-[13px] text-[#71869b]">{store.address || "Address pending"}</p>
                </div>
                <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8aa0b4]">
                    <span>{categoryLabels[store.category] || "Gifts"}</span>
                    <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" />{store.images?.length || 0}/3</span>
                </div>
                {showActions && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <button type="button" onClick={(event) => { event.stopPropagation(); onApprove(store.id); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-none bg-[#0057B7] text-[12px] font-bold text-white transition-colors hover:bg-[#004798]">
                            <Check className="h-4 w-4" /> Approve
                        </button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); onReject(store.id); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-none border border-[#f1c6c6] bg-white text-[12px] font-bold text-[#ae3c3c] transition-colors hover:bg-[#fff4f4]">
                            <X className="h-4 w-4" /> Reject
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}

export function AdminStoreCard(props: AdminStoreCardProps) {
    return props.viewMode === "list" ? <ListViewRow {...props} /> : <GridViewCard {...props} />;
}

export { BrandCircle, StatusBadge };
