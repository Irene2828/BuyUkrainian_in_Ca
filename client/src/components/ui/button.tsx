import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-normal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default:
          "bg-[#0057B7] text-white hover:bg-[#0047A0] hover:scale-[1.02] shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/95 shadow-sm hover:shadow-md",
        outline:
          "border border-[#0057B7] text-[#0057B7] bg-white/55 backdrop-blur-md hover:bg-white/75 hover:scale-[1.02] shadow-none",
        secondary:
          "bg-[var(--color-bg-gray)] text-[var(--color-text-primary)] hover:bg-slate-100 shadow-sm",
        accent:
          "bg-[#FFD700] text-[#0057B7] hover:bg-[#0057B7] hover:text-white hover:border-[#0057B7] hover:scale-[1.02] border border-[#FFD700] shadow-none font-medium",
        ghost: "hover:bg-slate-50 text-[var(--color-text-primary)]",
        link: "text-[var(--color-primary-blue)] underline-offset-4 hover:underline hover:opacity-85",
      },
      size: {
        default: "h-12 px-4 py-4 rounded-[32px] text-base", // 48px height, 16px padding
        sm: "h-9 rounded-[32px] px-4 py-4 text-sm",
        lg: "h-14 rounded-[32px] px-4 py-4 text-lg",
        icon: "h-10 w-10 rounded-[32px] p-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
