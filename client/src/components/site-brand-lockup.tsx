import { cn } from "@/lib/utils";

interface SiteBrandLockupProps {
  className?: string;
  tone?: "default" | "onBlue";
}

export function SiteBrandLockup({ className, tone = "default" }: SiteBrandLockupProps) {
  return (
    <div className={cn("relative flex h-[58px] w-[170px] shrink-0 items-center justify-center select-none", className)} aria-label="Buy Ukrainian in Canada">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 170 58"
        fill="none"
        aria-hidden="true"
      >
        <path d="M1 29C1 13.5 38.6 1 85 1C131.4 1 169 13.5 169 29" stroke="#0057B7" strokeWidth="2" />
        <path d="M1 29C1 44.5 38.6 57 85 57C131.4 57 169 44.5 169 29" stroke="#FFD700" strokeWidth="2" />
      </svg>
      <div className="relative flex flex-col items-center justify-center gap-[1.5px] text-center">
        <span className={cn(
          "whitespace-nowrap text-[11.7px] font-medium leading-[0.94] tracking-[-0.045em] opacity-90 antialiased md:text-[12.75px]",
          tone === "onBlue" ? "text-white" : "text-[#1E293B]"
        )}>
          Buy Ukrainian
        </span>
        <span className={cn(
          "whitespace-nowrap text-[11.7px] font-medium leading-[0.94] tracking-[-0.045em] opacity-90 antialiased md:text-[12.75px]",
          tone === "onBlue" ? "text-white" : "text-[#1E293B]"
        )}>
          in Canada
        </span>
      </div>
    </div>
  );
}
