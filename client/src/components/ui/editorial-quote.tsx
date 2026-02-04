import { ReactNode } from "react";

interface EditorialQuoteProps {
    children: ReactNode;
    className?: string;
}

/**
 * Editorial-style quote container with thin-stroke serif quotes
 * Apple-inspired minimalist design with #F5F5F7 text
 */
export function EditorialQuote({ children, className = "" }: EditorialQuoteProps) {
    return (
        <div className={`relative ${className}`}>
            {/* Opening Quote - Thin Stroke Serif */}
            <div
                className="absolute top-8 left-8 md:top-12 md:left-14 pointer-events-none select-none z-0 opacity-30"
                aria-hidden="true"
            >
                <svg
                    width="48"
                    height="48"
                    viewBox="0 0 140 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                >
                    <path
                        d="M46.6667 81.6667C46.6667 65.55 56.5833 52.5 70 46.6667V35C40.8333 35 17.5 58.3333 17.5 93.3333H46.6667V81.6667ZM93.3333 93.3333H122.5V81.6667C122.5 65.55 132.417 52.5 145.833 46.6667V35C116.667 35 93.3333 58.3333 93.3333 93.3333Z"
                        fill="#FFFFFF"
                        fillOpacity="0.15"
                    />
                </svg>
            </div>

            {/* Closing Quote - Thin Stroke Serif */}
            <div
                className="absolute bottom-8 right-8 md:bottom-12 md:right-14 pointer-events-none select-none z-0 rotate-180 opacity-30"
                aria-hidden="true"
            >
                <svg
                    width="48"
                    height="48"
                    viewBox="0 0 140 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                >
                    <path
                        d="M46.6667 81.6667C46.6667 65.55 56.5833 52.5 70 46.6667V35C40.8333 35 17.5 58.3333 17.5 93.3333H46.6667V81.6667ZM93.3333 93.3333H122.5V81.6667C122.5 65.55 132.417 52.5 145.833 46.6667V35C116.667 35 93.3333 58.3333 93.3333 93.3333Z"
                        fill="#FFFFFF"
                        fillOpacity="0.15"
                    />
                </svg>
            </div>

            {/* Content */}
            <div className="px-6 md:px-12 mb-8 w-full max-w-[650px] mx-auto text-center relative z-10">
                <p className="text-[18px] md:text-xl font-normal italic text-[#F5F5F7] leading-relaxed tracking-normal">
                    {children}
                </p>
            </div>
        </div>
    );
}
