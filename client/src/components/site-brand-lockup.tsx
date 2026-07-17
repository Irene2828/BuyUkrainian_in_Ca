import { HeaderPinLogo } from "@/components/header-pin-logo";
import { cn } from "@/lib/utils";

interface SiteBrandLockupProps {
  className?: string;
}

export function SiteBrandLockup({ className }: SiteBrandLockupProps) {
  return (
    <div className={cn("flex items-center select-none", className)}>
      <HeaderPinLogo className="h-[44.1px] w-auto shrink-0 overflow-visible" />
      <div className="ml-[2.3px] h-[33.6px] w-[2.1px] shrink-0 bg-[#FFD700]" />
      <div className="ml-[11.7px] flex flex-col justify-center gap-[1.5px] py-px">
        <span className="whitespace-nowrap text-[13.5px] font-semibold leading-[0.94] tracking-[-0.045em] text-[#1E293B] opacity-80 antialiased md:text-[14.5px]">
          Buy Ukrainian
        </span>
        <span className="whitespace-nowrap text-[13.5px] font-semibold leading-[0.94] tracking-[-0.045em] text-[#1E293B] opacity-80 antialiased md:text-[14.5px]">
          in Canada
        </span>
      </div>
    </div>
  );
}
