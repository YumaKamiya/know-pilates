"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "default" | "lg";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles - 50-60代向け 最小44px
          "inline-flex items-center justify-center rounded-lg font-semibold",
          "transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "min-h-[44px] min-w-[44px]",
          // Variants
          {
            // Primary - テラコッタ
            "bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500":
              variant === "primary",
            // Secondary - ベージュ
            "bg-primary-200 text-primary-800 hover:bg-primary-300 focus:ring-primary-500":
              variant === "secondary",
            // Outline
            "border-2 border-accent-500 text-accent-600 bg-transparent hover:bg-accent-50 focus:ring-accent-500":
              variant === "outline",
          },
          // Sizes
          {
            "px-6 py-3 text-lg": size === "default",
            "px-8 py-4 text-xl": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
