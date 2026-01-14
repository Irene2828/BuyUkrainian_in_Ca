import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

export function LanguageSwitcher({ className }: { className?: string }) {
    const { language, setLanguage } = useI18n();
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-black/5 text-[#4B5563] outline-none data-[state=open]:bg-black/5",
                        className
                    )}
                    aria-label="Choose a language"
                >
                    <Globe className="w-5 h-5 stroke-[1.5]" />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="z-50 w-[180px] rounded-[16px] border border-[#D3E4FD] bg-white/90 backdrop-blur-md p-2 shadow-sm outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                    sideOffset={8}
                    align="end"
                >
                    <div className="flex flex-col gap-1">
                        <Popover.Close asChild>
                            <button
                                onClick={() => setLanguage('en')}
                                className={cn(
                                    "flex items-center justify-between px-3 py-2.5 rounded-[10px] transition-colors text-[14px]",
                                    language === 'en'
                                        ? "bg-[#D3E4FD]/30 text-black font-medium"
                                        : "text-gray-600 hover:bg-black/5 hover:text-black font-medium"
                                )}
                            >
                                <span>English</span>
                                {language === 'en' && <div className="w-1.5 h-1.5 rounded-full bg-[#006CE4]" />}
                            </button>
                        </Popover.Close>
                        <Popover.Close asChild>
                            <button
                                onClick={() => setLanguage('ua')}
                                className={cn(
                                    "flex items-center justify-between px-3 py-2.5 rounded-[10px] transition-colors text-[14px]",
                                    language === 'ua'
                                        ? "bg-[#D3E4FD]/30 text-black font-medium"
                                        : "text-gray-600 hover:bg-black/5 hover:text-black font-medium"
                                )}
                            >
                                <span>Українська</span>
                                {language === 'ua' && <div className="w-1.5 h-1.5 rounded-full bg-[#006CE4]" />}
                            </button>
                        </Popover.Close>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
