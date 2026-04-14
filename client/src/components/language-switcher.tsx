import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGUAGE_OPTIONS = [
  { code: "en", shortLabel: "EN" },
  { code: "fr-CA", shortLabel: "FR" },
  { code: "uk", shortLabel: "UKR" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useI18n();

  return (
    <div className={cn("flex items-center gap-2 text-[13px] tracking-[0.08em] antialiased", className)} aria-label="Language selector">
      {LANGUAGE_OPTIONS.map((option, index) => (
        <span key={option.code} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden="true" className="text-slate-300 font-normal">·</span>}
          <span
            role="button"
            tabIndex={0}
            onClick={() => setLanguage(option.code)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setLanguage(option.code);
              }
            }}
            className={cn(
              "cursor-pointer select-none transition-colors",
              language === option.code ? "text-slate-800 font-medium" : "text-slate-400 font-normal hover:text-slate-600",
            )}
          >
            {option.shortLabel}
          </span>
        </span>
      ))}
    </div>
  );
}
