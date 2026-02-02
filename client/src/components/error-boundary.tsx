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
                return <MapErrorFallback onRetry={this.handleRetry} />;
            }

            if (fallbackType === 'list') {
                return <ListErrorFallback onRetry={this.handleRetry} />;
            }

            return <GenericErrorFallback onRetry={this.handleRetry} />;
        }

        return this.props.children;
    }
}

// Map-specific error fallback
function MapErrorFallback({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-[32px] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-[24px] font-bold text-gray-800 mb-2 font-header">
                Map Currently Unavailable
            </h3>
            <p className="text-[14px] text-gray-500 mb-6 max-w-sm font-ui">
                We're having trouble loading the map. This could be a temporary network issue.
            </p>
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 h-12 px-6 bg-black text-white rounded-full font-medium text-[14px] hover:bg-black/90 active:scale-95 transition-all font-ui"
            >
                <RefreshCw className="w-4 h-4" />
                Try Again
            </button>
        </div>
    );
}

// List-specific error fallback
function ListErrorFallback({ onRetry }: { onRetry: () => void }) {
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
                className="inline-flex items-center gap-2 h-10 px-5 bg-gray-100 text-gray-800 rounded-full font-medium text-[14px] hover:bg-gray-200 active:scale-95 transition-all font-ui"
            >
                <RefreshCw className="w-4 h-4" />
                Retry
            </button>
        </div>
    );
}

// Generic error fallback
function GenericErrorFallback({ onRetry }: { onRetry: () => void }) {
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
                className="inline-flex items-center gap-2 h-10 px-5 bg-gray-900 text-white rounded-full font-medium text-[13px] hover:bg-gray-800 active:scale-95 transition-all font-ui"
            >
                <RefreshCw className="w-4 h-4" />
                Try Again
            </button>
        </div>
    );
}

export { MapErrorFallback, ListErrorFallback, GenericErrorFallback };
