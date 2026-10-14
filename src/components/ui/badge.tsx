import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-normal transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/60",
        destructive:
          "bg-[var(--destructive-subtle)] text-[var(--color-destructive)] border border-[var(--color-destructive)]/20",
        outline:
          "text-foreground border border-border/80 bg-background/50",
        success:
          "bg-[var(--success-subtle)] text-[var(--color-success)] border border-[var(--color-success)]/20",
        warning:
          "bg-[var(--warning-subtle)] text-[var(--color-warning)] border border-[var(--color-warning)]/20",
        info:
          "bg-[var(--info-subtle)] text-[var(--color-info)] border border-[var(--color-info)]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  const dotColorMap: Record<string, string> = {
    default: "bg-primary",
    secondary: "bg-secondary-foreground",
    destructive: "bg-[var(--color-destructive)]",
    outline: "bg-foreground/50",
    success: "bg-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]",
    info: "bg-[var(--color-info)]",
  };

  const dotClass = dotColorMap[variant || "default"] || "bg-primary";

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClass)} />}
      <span>{children}</span>
    </div>
  );
}

export { Badge, badgeVariants };
