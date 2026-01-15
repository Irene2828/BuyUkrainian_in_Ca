import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ className }: { className?: string }) {
    const { language, setLanguage } = useI18n();
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    if (!mounted) return null;

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger - Globe Button (no title attribute) */}
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    "no-invert-hover w-10 h-10 flex items-center justify-center text-black/65 hover:text-black transition-colors duration-200 outline-none focus:outline-none",
                    className
                )}
                aria-label="Choose a language"
                aria-expanded={open}
            >
                <Globe className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Airbnb-Style Micro-Modal */}
            <div
                className={cn(
                    "absolute top-12 right-0 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl z-50 overflow-hidden",
                    "origin-top-right transition-all duration-200",
                    open
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                )}
                style={{ animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)' }}
            >
                {/* Header Label */}
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 px-4 py-2 border-b border-gray-100">
                    Language
                </div>

                {/* Language Options */}
                <div className="py-1">
                    <button
                        onClick={() => {
                            setLanguage('en');
                            setOpen(false);
                        }}
                        className={cn(
                            "no-invert-hover w-full px-4 py-3 text-[14px] font-medium hover:bg-gray-50 flex justify-between items-center transition-all text-left",
                            language === 'en' ? "text-gray-900" : "text-gray-400"
                        )}
                    >
                        <span>English</span>
                        {language === 'en' && (
                            <div className="w-2 h-2 rounded-full bg-[#3C93EA]" />
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setLanguage('ua');
                            setOpen(false);
                        }}
                        className={cn(
                            "no-invert-hover w-full px-4 py-3 text-[14px] font-medium hover:bg-gray-50 flex justify-between items-center transition-all text-left",
                            language === 'ua' ? "text-gray-900" : "text-gray-400"
                        )}
                    >
                        <span>Українська</span>
                        {language === 'ua' && (
                            <div className="w-2 h-2 rounded-full bg-[#F3FF0A]" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
