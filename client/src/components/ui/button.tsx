import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-[-0.02em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-700 ease-out hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-colors duration-200",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/95 shadow-sm hover:shadow-md",
        outline:
          "border border-[var(--color-primary-blue)] text-[var(--color-primary-blue)] bg-white hover:bg-slate-50 border-transparent shadow-sm",
        secondary:
          "bg-[var(--color-bg-gray)] text-[var(--color-text-primary)] hover:bg-slate-100 shadow-sm",
        accent:
          "bg-[var(--color-accent-yellow)] text-[var(--color-text-primary)] hover:bg-[var(--color-primary-yellow)]/90 border border-[var(--color-accent-yellow)] shadow-sm hover:shadow-md font-semibold",
        ghost: "hover:bg-slate-50 text-[var(--color-text-primary)]",
        link: "text-[var(--color-primary-blue)] underline-offset-4 hover:underline hover:opacity-85",
      },
      size: {
        default: "h-12 px-4 py-4 rounded-full text-base", // 48px height, 16px padding
        sm: "h-9 rounded-full px-4 py-4 text-sm",
        lg: "h-14 rounded-full px-4 py-4 text-lg",
        icon: "h-10 w-10 rounded-full p-4",
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
