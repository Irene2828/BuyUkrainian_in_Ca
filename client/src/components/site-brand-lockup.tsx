import { cn } from "@/lib/utils";

interface SiteBrandLockupProps {
  className?: string;
  tone?: "default" | "onBlue";
}

export function SiteBrandLockup({ className, tone = "default" }: SiteBrandLockupProps) {
  return (
    <div className={cn("relative flex flex-col justify-center gap-[1.5px] px-[27px] py-[13.5px] select-none", className)} aria-label="Buy Ukrainian in Canada">
      <div className={cn(
        "absolute inset-0 border rounded-[50%] transition-colors duration-300 pointer-events-none",
        tone === "onBlue" ? "border-white/60" : "border-[#FFD700]"
      )}></div>
      <span className={cn(
        "text-[13.75px] font-['Plus_Jakarta_Sans'] font-semibold tracking-[-0.02em] opacity-90 whitespace-nowrap leading-[0.94] antialiased text-center",
        tone === "onBlue" ? "text-white" : "text-[#1E293B]"
      )}>
        Buy Ukrainian
      </span>
      <span className={cn(
        "text-[13.75px] font-['Plus_Jakarta_Sans'] font-semibold tracking-[-0.02em] opacity-90 whitespace-nowrap leading-[0.94] antialiased text-center",
        tone === "onBlue" ? "text-white" : "text-[#1E293B]"
      )}>
        in Canada
      </span>
    </div>
  );
}
