import React from 'react';
import { cn } from '@/lib/utils';

// Base skeleton component with shimmer animation
function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
                className
            )}
            style={{
                animation: 'shimmer 1.35s ease-in-out infinite',
            }}
        />
    );
}

// Store Card Skeleton - Following 32-24-16 rhythm
export function StoreCardSkeleton() {
    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 animate-in fade-in duration-300">
            {/* Category Tag - 32px element */}
            <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Title - 24px rhythm */}
            <Skeleton className="h-6 w-3/4 rounded-lg mb-2" />
            <Skeleton className="h-4 w-1/2 rounded-lg mb-4" />

            {/* Address - 16px rhythm */}
            <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
            </div>
            <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>

            {/* Button - 32px height */}
            <Skeleton className="h-12 w-full rounded-full" />
        </div>
    );
}

// Store List Item Skeleton
export function StoreListItemSkeleton() {
    return (
        <div className="border-l-[3px] border-slate-100 pl-4 py-2 w-full animate-pulse transition-opacity">
            <Skeleton className="h-5 w-3/4 rounded-lg mb-2" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
        </div>
    );
}

// Map Section Skeleton
export function MapSkeleton() {
    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-gray-100 to-gray-50 rounded-[20px] relative overflow-hidden">
            {/* Simulated map tiles */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-px opacity-30">
                {Array.from({ length: 16 }).map((_, i) => (
                    <Skeleton key={i} className="bg-gray-200" />
                ))}
            </div>

            {/* Loading indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 relative">
                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-gray-400 rounded-full animate-spin" />
                    </div>
                    <p className="text-[14px] text-gray-500 font-ui">Loading map...</p>
                </div>
            </div>
        </div>
    );
}

// Recently Added Section Skeleton
export function RecentlyAddedSkeleton() {
    return (
        <div className="w-full overflow-hidden py-4">
            <div className="flex gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <Skeleton className="h-5 w-3/4 rounded-lg mb-2" />
                                <Skeleton className="h-3 w-1/2 rounded-lg" />
                            </div>
                            <Skeleton className="w-[80px] h-[80px] rounded-2xl shrink-0" />
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-3 w-24 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Filter Tabs Skeleton
export function FilterTabsSkeleton() {
    return (
        <div className="flex gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-20 rounded-full" />
            ))}
        </div>
    );
}

// Full Page Loading Skeleton
export function PageLoadingSkeleton() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <Skeleton className="h-10 w-2/3 mx-auto rounded-lg" />
                <Skeleton className="h-5 w-1/2 mx-auto rounded-lg" />
            </div>

            {/* Filter tabs */}
            <FilterTabsSkeleton />

            {/* Map placeholder */}
            <MapSkeleton />

            {/* Store list */}
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <StoreListItemSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

// Add shimmer keyframes to global styles
const shimmerStyles = `
@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
    const styleId = 'skeleton-shimmer-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = shimmerStyles;
        document.head.appendChild(style);
    }
}

export { Skeleton };
