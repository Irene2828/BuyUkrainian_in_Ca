import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, MapPin } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackType?: 'map' | 'list' | 'generic';
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            const { fallbackType = 'generic' } = this.props;

            if (fallbackType === 'map') {
                return <MapErrorFallback onRetry={this.handleRetry} error={this.state.error} />;
            }

            if (fallbackType === 'list') {
                return <ListErrorFallback onRetry={this.handleRetry} error={this.state.error} />;
            }

            return <GenericErrorFallback onRetry={this.handleRetry} error={this.state.error} />;
        }

        return this.props.children;
    }
}

// Map-specific error fallback
function MapErrorFallback({ onRetry, error }: { onRetry: () => void, error?: Error | null }) {
    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-[20px] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-[24px] font-bold text-gray-800 mb-2 font-header">
                Map Currently Unavailable
            </h3>
            <p className="text-[14px] text-red-500 mb-2 font-bold max-w-sm font-ui">
                ERROR: {error?.message || "Unknown error"}
            </p>
            <p className="text-[14px] text-gray-500 mb-6 max-w-sm font-ui">
                We're having trouble loading the map. This could be a temporary network issue.
            </p>
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 h-12 px-6 bg-[#0057B7] text-white rounded-[32px] font-medium tracking-normal text-[14px] hover:bg-[#0047A0] hover:scale-[1.02] active:scale-95 transition-all duration-300 font-ui"
            >
                <RefreshCw className="w-4 h-4" />
                Try Again
            </button>
        </div>
    );
}

// List-specific error fallback
function ListErrorFallback({ onRetry, error }: { onRetry: () => void, error?: Error | null }) {
    return (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-[20px] font-bold text-gray-800 mb-2 font-header">
                Unable to Load Stores
            </h3>
            <p className="text-[14px] text-gray-500 mb-4 max-w-sm font-ui">
                Something went wrong while loading the store list. Please try again.
            </p>
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 h-10 px-5 border border-[#0057B7] bg-white/55 backdrop-blur-md text-[#0057B7] rounded-[32px] font-medium tracking-normal text-[14px] hover:bg-white/75 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-ui"
            >
                <RefreshCw className="w-4 h-4" />
                Retry
            </button>
        </div>
    );
}

// Generic error fallback
function GenericErrorFallback({ onRetry, error }: { onRetry: () => void, error?: Error | null }) {
    return (
        <div className="w-full py-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-[18px] font-bold text-gray-800 mb-2 font-header">
                Something Went Wrong
            </h3>
            <p className="text-[13px] text-gray-500 mb-4 font-ui">
                An unexpected error occurred.
            </p>
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 h-10 px-5 bg-[#0057B7] text-white rounded-[32px] font-medium tracking-normal text-[13px] hover:bg-[#0047A0] hover:scale-[1.02] active:scale-95 transition-all duration-300 font-ui"
            >
                <RefreshCw className="w-4 h-4" />
                Try Again
            </button>
        </div>
    );
}

export { MapErrorFallback, ListErrorFallback, GenericErrorFallback };
