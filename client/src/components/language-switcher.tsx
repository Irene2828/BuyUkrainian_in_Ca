import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "fr-CA", label: "Français", shortLabel: "FR" },
  { code: "uk", label: "Українська", shortLabel: "UKR" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useI18n();

  return (
    <div className={cn("flex items-center antialiased", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900 outline-none border-none bg-transparent cursor-pointer"
            aria-label="Change language"
          >
            <Globe className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[140px] bg-white border border-slate-200 shadow-xl rounded-xl p-1 z-[100]">
          {LANGUAGE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.code}
              onClick={() => setLanguage(option.code)}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded-lg cursor-pointer transition-colors outline-none",
                language === option.code 
                  ? "bg-slate-50 text-[#0057B7]" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span>{option.label}</span>
              <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider">{option.shortLabel}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
