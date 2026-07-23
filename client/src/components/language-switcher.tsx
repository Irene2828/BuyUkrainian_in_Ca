import { useI18n, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", short: "EN", flag: "🇨🇦" },
  { code: "uk", label: "Українська", short: "UA", flag: "🇺🇦" },
  { code: "fr-CA", label: "Français", short: "FR", flag: "🇨🇦" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useI18n();
  const currentOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-1.5 pl-2 pr-0 py-2 rounded-full hover:opacity-70 transition-opacity duration-200 outline-none group"
            aria-label="Change language"
          >
            <Globe className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
            <span className="flex items-center gap-1.5 text-[16px] leading-none mb-[1px]">
              {currentOption.flag} <span className="text-[13px] font-semibold text-slate-600 tracking-normal">{currentOption.short}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px] p-1.5 font-sans border-slate-100 shadow-xl shadow-slate-200/50">
          {LANGUAGE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.code}
              onClick={() => setLanguage(option.code as Language)}
              className={cn(
                "cursor-pointer text-[13.5px] py-2 px-3 rounded-md transition-colors font-medium outline-none",
                language === option.code 
                  ? "bg-slate-50 text-slate-900" 
                  : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-800"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                <span className="text-[9px] font-bold tracking-wider text-slate-300 ml-2">{option.short}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
