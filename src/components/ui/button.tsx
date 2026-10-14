import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[transform,background-color,box-shadow,color,border-color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary to-[oklch(0.50_0.22_260)] text-primary-foreground shadow-xs [box-shadow:inset_0_1px_0_0_rgb(255_255_255/0.18)] [@media(hover:hover)]:hover:brightness-105 active:brightness-95",
        destructive:
          "bg-gradient-to-b from-destructive to-[oklch(0.52_0.22_25)] text-destructive-foreground shadow-xs [box-shadow:inset_0_1px_0_0_rgb(255_255_255/0.18)] [@media(hover:hover)]:hover:brightness-105 active:brightness-95",
        outline:
          "border border-border/80 bg-card text-foreground shadow-xs [@media(hover:hover)]:hover:bg-accent [@media(hover:hover)]:hover:border-foreground/20 active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs [@media(hover:hover)]:hover:bg-secondary/80 active:bg-secondary/90",
        ghost:
          "text-foreground/80 [@media(hover:hover)]:hover:bg-accent [@media(hover:hover)]:hover:text-foreground active:bg-accent/80",
        link: "text-primary underline-offset-4 [@media(hover:hover)]:hover:underline",
      },
      size: {
        default: "h-9 px-3.5 py-1.5 text-xs font-semibold",
        sm: "h-8 rounded-md px-2.5 text-xs",
        lg: "h-11 rounded-xl px-6 text-sm font-semibold",
        icon: "h-9 w-9",
        keypad: "h-14 w-full text-lg font-semibold rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
