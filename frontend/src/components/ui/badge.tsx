import * as React from "react"

import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline"
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        variant === "default" &&
          "border-transparent bg-primary/90 text-primary-foreground shadow-sm",
        variant === "secondary" &&
          "border-transparent bg-secondary/80 text-secondary-foreground",
        variant === "outline" &&
          "border-border/60 bg-background/40 text-foreground",
        className,
      )}
      {...props}
    />
  )
}


