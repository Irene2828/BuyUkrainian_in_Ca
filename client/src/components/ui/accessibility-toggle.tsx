import { Eye, EyeOff } from "lucide-react";
import { useAccessibility } from "@/contexts/accessibility-context";
import { cn } from "@/lib/utils";

/**
 * Universal Access Toggle
 * Switches between premium minimalist design and high-contrast accessible mode
 * WCAG 2.1 Level AA compliant
 */
export function AccessibilityToggle({ className }: { className?: string }) {
    const { accessibleMode, toggleAccessibleMode } = useAccessibility();

    return (
        <button
            onClick={toggleAccessibleMode}
            className={cn("uppercase transition-colors bg-transparent border-none p-0 outline-none focus:outline-none", className)}
            aria-label={accessibleMode ? "Disable high-contrast mode" : "Enable high-contrast mode"}
            aria-pressed={accessibleMode}
        >
            ACCESSIBILITY
        </button>
    );
}
