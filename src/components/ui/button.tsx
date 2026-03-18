import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-yellow-300 to-amber-400 text-slate-950 " +
          "hover:from-yellow-200 hover:to-amber-300 " +
          "shadow-[0_0_30px_rgba(250,204,21,0.75)] " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/70",
        outline:
          "border border-yellow-400/60 bg-slate-900/40 text-slate-50 " +
          "hover:bg-slate-900/70 hover:border-yellow-300/80 " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60",
        ghost:
          "bg-transparent text-gray-200 hover:bg-white/5 " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6 text-base",
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
