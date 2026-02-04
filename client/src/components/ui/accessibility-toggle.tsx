import { Eye, EyeOff } from "lucide-react";
import { useAccessibility } from "@/contexts/accessibility-context";
import { cn } from "@/lib/utils";

/**
 * Universal Access Toggle
 * Switches between premium minimalist design and high-contrast accessible mode
 * WCAG 2.1 Level AA compliant
 */
export function AccessibilityToggle() {
    const { accessibleMode, toggleAccessibleMode } = useAccessibility();

    return (
        <button
            onClick={toggleAccessibleMode}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors bg-transparent border-none p-0 outline-none focus:outline-none"
            aria-label={accessibleMode ? "Disable high-contrast mode" : "Enable high-contrast mode"}
            aria-pressed={accessibleMode}
        >
            ACCESSIBILITY
        </button>
    );
}
