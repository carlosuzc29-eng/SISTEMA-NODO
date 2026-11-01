import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-normal transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink-magenta-subtle)] text-[var(--ink-magenta-foreground)] border border-[var(--ink-magenta)]/25 font-semibold",
        cyan:
          "bg-[var(--ink-cyan-subtle)] text-[var(--ink-cyan-foreground)] border border-[var(--ink-cyan)]/25",
        yellow:
          "bg-[var(--ink-yellow-subtle)] text-[var(--ink-yellow-foreground)] border border-[var(--ink-yellow)]/30",
        key:
          "bg-[var(--ink-key-subtle)] text-[var(--ink-key-foreground)] border border-border/80",
        success:
          "bg-[var(--color-registry-green-subtle)] text-[var(--color-registry-green-foreground)] border border-[var(--color-registry-green)]/25",
        warning:
          "bg-[var(--ink-yellow-subtle)] text-[var(--ink-yellow-foreground)] border border-[var(--ink-yellow)]/30",
        orange:
          "bg-[var(--color-pantone-orange-subtle)] text-[var(--color-pantone-orange-foreground)] border border-[var(--color-pantone-orange)]/25",
        info:
          "bg-[var(--ink-cyan-subtle)] text-[var(--ink-cyan-foreground)] border border-[var(--ink-cyan)]/25",
        destructive:
          "bg-[var(--destructive-subtle)] text-[var(--color-destructive)] border border-[var(--color-destructive)]/25",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/70",
        outline:
          "text-foreground border border-border bg-card/80",
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
    default: "bg-[var(--ink-magenta)]",
    cyan: "bg-[var(--ink-cyan)]",
    yellow: "bg-[var(--ink-yellow)]",
    key: "bg-[var(--ink-key)]",
    success: "bg-[var(--color-registry-green)]",
    warning: "bg-[var(--ink-yellow)]",
    orange: "bg-[var(--color-pantone-orange)]",
    info: "bg-[var(--ink-cyan)]",
    destructive: "bg-[var(--color-destructive)]",
    secondary: "bg-secondary-foreground",
    outline: "bg-foreground/50",
  };

  const dotClass = dotColorMap[variant || "default"] || "bg-[var(--ink-magenta)]";

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClass)} />}
      <span>{children}</span>
    </div>
  );
}

export { Badge, badgeVariants };
