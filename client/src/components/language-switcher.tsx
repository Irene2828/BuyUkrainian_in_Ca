import { Check, Globe2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LanguageMenuOption = {
  code: Language | "fr";
  label: string;
  hint: string;
  available: boolean;
};

const LANGUAGE_OPTIONS: LanguageMenuOption[] = [
  {
    code: "en",
    label: "English",
    hint: "Current source copy",
    available: true,
  },
  {
    code: "ua",
    label: "Українська",
    hint: "Active translation",
    available: true,
  },
  {
    code: "fr",
    label: "Français",
    hint: "Planned next",
    available: false,
  },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex items-center", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-label="Select site language"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        onFocus={() => setIsOpen(true)}
        className={cn(
          "flex h-[38px] w-[38px] items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 transition-all duration-200",
          "hover:border-[#0057B7]/25 hover:text-[#0057B7] hover:shadow-[0_6px_18px_rgba(10,37,64,0.08)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0057B7]/20",
        )}
      >
        <Globe2 className="h-4 w-4" strokeWidth={2} />
      </button>

      <div
        role="menu"
        aria-label="Language options"
        className={cn(
          "absolute right-0 top-[calc(100%+10px)] z-[700] w-[196px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5",
          "origin-top-right transition-all duration-200 ease-out",
          isOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <div className="p-1.5">
          {LANGUAGE_OPTIONS.map((option) => {
            const isActive = option.code === language;
            const isDisabled = !option.available;

            return (
              <button
                key={option.code}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                disabled={isDisabled}
                onClick={() => {
                  if (!option.available) {
                    return;
                  }

                  setLanguage(option.code as Language);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors",
                  isActive && "bg-slate-50 text-[#2D50A0]",
                  !isActive && !isDisabled && "text-slate-600 hover:bg-slate-200 hover:text-slate-900",
                  isDisabled && "cursor-not-allowed text-slate-400 opacity-80",
                )}
              >
                <span className="flex flex-col">
                  <span className="text-[14px] font-medium tracking-tight">{option.label}</span>
                  <span className="text-[11px] font-medium text-slate-400">{option.hint}</span>
                </span>

                {isDisabled ? (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Soon
                  </span>
                ) : isActive ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EFF6FF] text-[#0057B7]">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {option.code}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
