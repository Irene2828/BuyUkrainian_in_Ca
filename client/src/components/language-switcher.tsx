import { useI18n, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", short: "EN", flag: "🇨🇦" },
  { code: "uk", label: "Українська", short: "UKR", flag: "🇺🇦" },
  { code: "fr-CA", label: "Français", short: "FR", flag: "🇨🇦" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useI18n();
  const currentOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative flex items-center gap-1 md:gap-1.5 pl-2 pr-0 py-0.5 rounded-full hover:opacity-70 transition-opacity duration-200 group">
        <Globe className="pointer-events-none w-[0.9rem] h-[0.9rem] lg:w-[0.95rem] lg:h-[0.95rem] min-[1600px]:w-[1.0rem] min-[1600px]:h-[1.0rem] text-slate-500" strokeWidth={1.5} />
        <span className="pointer-events-none flex items-center gap-0.5 md:gap-1.5 leading-none">
          <span className="text-[0.85rem] md:text-[0.85rem] lg:text-[14px] xl:text-[14px] min-[1600px]:text-[16px] font-medium text-slate-500 tracking-normal">{currentOption.short}</span>
        </span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as Language)}
          aria-label="Change language"
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.flag} {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
