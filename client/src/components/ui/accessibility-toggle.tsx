import { Eye, EyeOff } from "lucide-react";
import { useAccessibility } from "@/contexts/accessibility-context";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

/**
 * Universal Access Toggle
 * Switches between premium minimalist design and high-contrast accessible mode
 * WCAG 2.1 Level AA compliant
 */
export function AccessibilityToggle({ className }: { className?: string }) {
    const { accessibleMode, toggleAccessibleMode } = useAccessibility();
    const { t } = useI18n();

    return (
        <button
            onClick={toggleAccessibleMode}
            className={cn("transition-colors bg-transparent border-none p-0 cursor-pointer", className)}
            aria-label={accessibleMode ? t("common.accessibility.disable") : t("common.accessibility.enable")}
            aria-pressed={accessibleMode}
        >
            {t("common.accessibility.label")}
        </button>
    );
}
