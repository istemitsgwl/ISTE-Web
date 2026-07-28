import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-97",
          {
            "bg-primary text-primary-foreground shadow-sm hover:brightness-110":
              variant === "default",
            "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90":
              variant === "destructive",
            "border border-border bg-transparent text-card-foreground shadow-sm hover:bg-white/5 [.light_&]:hover:bg-black/5":
              variant === "outline",
            "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80":
              variant === "secondary",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "text-primary underline-offset-4 hover:underline": variant === "link",
            "bg-primary/10 text-primary border border-primary/30 shadow-[0_0_15px_rgba(207,159,255,0.2)] hover:bg-primary/20 hover:shadow-[0_0_25px_rgba(207,159,255,0.3)]":
              variant === "glow",
          },
          {
            "h-10 px-5 py-2": size === "default",
            "h-8 rounded-[10px] px-3 text-xs": size === "sm",
            "h-12 rounded-[16px] px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
