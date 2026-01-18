import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
    const { language, setLanguage } = useI18n();

    return (
        <div className={cn("relative flex items-center h-[38px] bg-white rounded-full p-1 w-[88px] border-[0.5px] border-slate-200", className)}>
            {/* Sliding Background (Graphite/Slate-900) */}
            <div
                className={cn(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-slate-900 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    language === 'en' ? "left-1" : "left-[50%]"
                )}
            />

            {/* EN Button */}
            <button
                onClick={() => setLanguage('en')}
                className={cn(
                    "relative z-10 flex-1 flex items-center justify-center h-full rounded-full text-[13px] font-medium transition-colors duration-200",
                    language === 'en' ? "text-white" : "text-slate-700 hover:bg-slate-50"
                )}
            >
                EN
            </button>

            {/* UA Button */}
            <button
                onClick={() => setLanguage('ua')}
                className={cn(
                    "relative z-10 flex-1 flex items-center justify-center h-full rounded-full text-[13px] font-medium transition-colors duration-200",
                    language === 'ua' ? "text-white" : "text-slate-700 hover:bg-slate-50"
                )}
            >
                UA
            </button>
        </div>
    );
}
