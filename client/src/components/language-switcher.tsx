import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function LanguageSwitcher({ className }: { className?: string }) {
    const { language, setLanguage } = useI18n();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className={cn("flex items-center gap-2 font-ui", className)}>
            <button
                onClick={() => setLanguage('en')}
                className={cn(
                    "text-[14px] font-medium transition-colors",
                    language === 'en' ? "text-black" : "text-gray-400 hover:text-black"
                )}
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                EN
            </button>
            <span className="text-gray-300 text-[14px]">|</span>
            <button
                onClick={() => setLanguage('ua')}
                className={cn(
                    "text-[14px] font-medium transition-colors",
                    language === 'ua' ? "text-black" : "text-gray-400 hover:text-black"
                )}
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                UA
            </button>
        </div>
    );
}
