"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive";
  size?: "default" | "lg";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles - 50-60代向け 最小48px
          "inline-flex items-center justify-center rounded-lg font-semibold",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "min-h-[48px] min-w-[120px]",
          // Variants
          {
            // Primary - テラコッタ
            "bg-accent-500 text-white border-2 border-accent-500 hover:bg-accent-600 hover:border-accent-600 active:bg-accent-700 focus-visible:ring-accent-500":
              variant === "primary",
            // Secondary - ベージュ
            "bg-primary-100 text-primary-800 border-2 border-primary-300 hover:bg-primary-200 hover:border-primary-400 active:bg-primary-300 focus-visible:ring-primary-500":
              variant === "secondary",
            // Outline
            "border-2 border-accent-500 text-accent-600 bg-transparent hover:bg-accent-50 active:bg-accent-100 focus-visible:ring-accent-500":
              variant === "outline",
            // Destructive - 危険なアクション用（赤）
            "bg-error-500 text-white border-2 border-error-500 hover:bg-error-600 hover:border-error-600 active:bg-error-700 focus-visible:ring-error-500":
              variant === "destructive",
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
