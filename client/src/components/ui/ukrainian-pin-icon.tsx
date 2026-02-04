export function UkrainianPinIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* Pin outline shape */}
            <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* Ukrainian flag - blue top half */}
            <path
                d="M12 6c2.21 0 4 1.79 4 4 0 0.5-0.1 1-0.3 1.4C15 12.5 14 13.5 12 15c-2-1.5-3-2.5-3.7-3.6C8.1 11 8 10.5 8 10c0-2.21 1.79-4 4-4z"
                fill="#0057B8"
                opacity="0.4"
            />
            {/* Ukrainian flag - yellow bottom half - positioned lower */}
            <path
                d="M8.3 11.4C8.1 11 8 10.5 8 10v3c0 1.3 0.8 2.4 2 3.2 0.6 0.4 1.3 0.7 2 0.8 0.7-0.1 1.4-0.4 2-0.8 1.2-0.8 2-1.9 2-3.2v-3c0 0.5-0.1 1-0.3 1.4-0.7 1.1-1.7 2.1-3.7 3.6-2-1.5-3-2.5-3.7-3.6z"
                fill="#FFD700"
                opacity="0.4"
            />
        </svg>
    );
}
