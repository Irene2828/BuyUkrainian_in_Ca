export function UkrainianFlagIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <defs>
                <clipPath id="circle-clip">
                    <circle cx="12" cy="12" r="10" />
                </clipPath>
            </defs>
            <rect x="2" y="2" width="20" height="20" fill="#0057B8" clipPath="url(#circle-clip)" />
            <rect x="2" y="12" width="20" height="10" fill="#FFD700" clipPath="url(#circle-clip)" />
        </svg>
    );
}
