import React from 'react';
import { Search, MapPin, Store, X } from 'lucide-react';

interface EmptyStateProps {
    type: 'no-results' | 'no-stores' | 'no-pending' | 'no-trash';
    searchQuery?: string;
    onClearFilters?: () => void;
}

export function EmptyState({ type, searchQuery, onClearFilters }: EmptyStateProps) {
    const configs = {
        'no-results': {
            icon: Search,
            title: 'No stores found',
            description: searchQuery
                ? `No stores match "${searchQuery}". Try adjusting your search or filters.`
                : "Try adjusting your filters to find what you're looking for.",
            showClearButton: true,
        },
        'no-stores': {
            icon: Store,
            title: 'No stores yet',
            description: 'Be the first to add a Ukrainian store in your area!',
            showClearButton: false,
        },
        'no-pending': {
            icon: MapPin,
            title: 'All caught up!',
            description: 'No pending submissions to review at the moment.',
            showClearButton: false,
        },
        'no-trash': {
            icon: X,
            title: 'Trash is empty',
            description: 'Rejected stores will appear here.',
            showClearButton: false,
        },
    };

    const config = configs[type];
    const IconComponent = config.icon;

    return (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            {/* Icon Container - 32px rhythm */}
            <div className="w-[64px] h-[64px] bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <IconComponent className="w-[32px] h-[32px] text-gray-400" />
            </div>

            {/* Title - 15px */}
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 font-header">
                {config.title}
            </h3>

            {/* Description - 14px */}
            <p className="text-[14px] text-gray-500 mb-6 max-w-md font-ui leading-relaxed">
                {config.description}
            </p>

            {/* Clear Filters Button */}
            {config.showClearButton && onClearFilters && (
                <button
                    onClick={onClearFilters}
                    className="group/clear-btn relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-slate-300 bg-slate-50/80 hover:bg-[#FFD700] hover:border-[#FFD700] text-[#0057B7] hover:text-[#003B7A] text-[14.8px] font-semibold transition-all duration-300 shadow-sm cursor-pointer outline-none whitespace-nowrap z-10 mx-auto hover:scale-[1.08] active:scale-[0.98]"
                >
                    <X className="w-[18px] h-[18px] text-current stroke-[2.5]" />
                    <span>Clear Filters</span>
                </button>
            )}
        </div>
    );
}

// Specific empty state for map view
export function MapEmptyState({ onClearFilters }: { onClearFilters?: () => void }) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[500] rounded-[20px]">
            <div className="text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-[15px] font-bold text-gray-800 mb-2 font-header">
                    No stores in this area
                </h3>
                <p className="text-[13px] text-gray-500 mb-4 max-w-xs font-ui">
                    Try zooming out or searching a different location.
                </p>
                {onClearFilters && (
                    <button
                        onClick={onClearFilters}
                        className="inline-flex items-center gap-2 h-10 px-5 border border-[#0057B7] bg-white/55 backdrop-blur-md text-[#0057B7] rounded-[32px] font-medium tracking-normal text-[14px] hover:bg-white/75 hover:scale-[1.02] transition-all duration-300 font-ui"
                    >
                        Reset View
                    </button>
                )}
            </div>
        </div>
    );
}
