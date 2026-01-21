import React from 'react';

interface LogoFlagProps {
    className?: string;
    width?: number | string;
    height?: number | string;
}

/**
 * BuyUkrainian.ca Logo Flag
 * Brand Colors (at 60% opacity):
 * - Top Blue: #0768FA
 * - Bottom Yellow: #F3FF00
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
                fill="#0768FA"
                fillOpacity="0.6"
            />
            {/* Bottom Yellow Half */}
            <rect
                x="0"
                y="30"
                width="100"
                height="30"
                rx="8"
                ry="8"
                fill="#F3FF00"
                fillOpacity="0.6"
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
                <rect x="0" y="0" width="100" height="30" fill="#0768FA" fillOpacity="0.6" />
                <rect x="0" y="30" width="100" height="30" fill="#F3FF00" fillOpacity="0.6" />
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
                    backgroundColor: '#0768FA',
                    opacity: 0.6
                }}
            />
            {/* Bottom Yellow */}
            <div
                style={{
                    width: '100%',
                    height: '50%',
                    backgroundColor: '#F3FF00',
                    opacity: 0.6
                }}
            />
        </div>
    );
}
