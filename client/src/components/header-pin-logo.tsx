interface HeaderPinLogoProps {
    className?: string;
}

export function HeaderPinLogo({ className = "" }: HeaderPinLogoProps) {
    return (
        <svg
            viewBox="0 0 320 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <defs>
                <radialGradient id="headerLogoRippleYellow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="headerLogoRippleBlue" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0057B7" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#0057B7" stopOpacity="0" />
                </radialGradient>

                <filter id="headerLogoTinyBlur" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" />
                </filter>
            </defs>

            {/* Pin outline */}
            <path
                d="M160 38 C114 38 78 74 78 120 C78 150 96 179 119 208 L160 261 L201 208 C224 179 242 150 242 120 C242 74 206 38 160 38Z"
                stroke="#0057B7"
                strokeWidth="16"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Centered circle */}
            <circle cx="160" cy="118" r="47" stroke="#FFD700" strokeWidth="16" fill="#FFFFFF" />

            {/* Shadow ripples */}
            <ellipse cx="160" cy="301" rx="58" ry="14" fill="url(#headerLogoRippleYellow)" filter="url(#headerLogoTinyBlur)" />
            <ellipse cx="160" cy="304" rx="86" ry="20" fill="url(#headerLogoRippleBlue)" filter="url(#headerLogoTinyBlur)" />
            <ellipse cx="160" cy="307" rx="112" ry="28" stroke="#0057B7" strokeOpacity="0.18" strokeWidth="2" />
            <ellipse cx="160" cy="305" rx="74" ry="17" stroke="#FFD700" strokeOpacity="0.28" strokeWidth="2" />

            {/* Radiating lines */}
            <g stroke="#0057B7" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round">
                <path d="M132 293 C118 287 103 282 86 278" />
                <path d="M188 293 C202 287 217 282 234 278" />
                <path d="M160 290 C160 281 160 273 160 264" />
            </g>

            {/* Ripple dots */}
            <g>
                <circle cx="86" cy="278" r="4.5" fill="#0057B7" fillOpacity="0.22" />
                <circle cx="234" cy="278" r="4.5" fill="#0057B7" fillOpacity="0.22" />
                <circle cx="160" cy="264" r="4.5" fill="#FFD700" fillOpacity="0.38" />
            </g>
        </svg>
    );
}
