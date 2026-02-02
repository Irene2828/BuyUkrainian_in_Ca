import React from 'react';

interface LogoFlagProps {
    className?: string;
    width?: number | string;
    height?: number | string;
}

/**
 * BuyUkrainian.ca Logo Flag
 * Brand Colors:
 * - Top Blue: #003D99 (at 38% opacity)
 * - Bottom Yellow: #FEEF1A (at 90% opacity)
 */
export function LogoFlag({ className = "", width = 100, height = 60 }: LogoFlagProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 100 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Top Blue Half */}
            <rect
                x="0"
                y="0"
                width="100"
                height="30"
                rx="8"
                ry="8"
                fill="#003D99"
                fillOpacity="0.38"
            />
            {/* Bottom Yellow Half */}
            <rect
                x="0"
                y="30"
                width="100"
                height="30"
                rx="8"
                ry="8"
                fill="#FEEF1A"
                fillOpacity="0.9"
            />
            {/* Cover corners for proper flag look */}
            <rect
                x="0"
                y="22"
                width="100"
                height="16"
                fill="none"
            />
            {/* Full flag frame with rounded corners */}
            <rect
                x="0"
                y="0"
                width="100"
                height="60"
                rx="8"
                ry="8"
                fill="none"
                stroke="none"
            />
            <clipPath id="flagClip">
                <rect x="0" y="0" width="100" height="60" rx="8" ry="8" />
            </clipPath>
            <g clipPath="url(#flagClip)">
                <rect x="0" y="0" width="100" height="30" fill="#003D99" fillOpacity="0.38" />
                <rect x="0" y="30" width="100" height="30" fill="#FEEF1A" fillOpacity="0.9" />
            </g>
        </svg>
    );
}

/**
 * Simple CSS-based Logo Flag using divs
 * Easier to style and maintain
 */
export function LogoFlagSimple({ className = "" }: { className?: string }) {
    return (
        <div
            className={`overflow-hidden rounded-lg ${className}`}
            style={{
                width: '100px',
                height: '60px',
                borderRadius: '8px'
            }}
        >
            {/* Top Blue */}
            <div
                style={{
                    width: '100%',
                    height: '50%',
                    backgroundColor: '#003D99',
                    opacity: 0.38
                }}
            />
            {/* Bottom Yellow */}
            <div
                style={{
                    width: '100%',
                    height: '50%',
                    backgroundColor: '#FEEF1A',
                    opacity: 0.9
                }}
            />
        </div>
    );
}
