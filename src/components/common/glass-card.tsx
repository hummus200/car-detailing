import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/15 bg-white/7 backdrop-blur-2xl",
        "shadow-[0_0_40px_rgba(15,23,42,0.85)]",
        "hover:border-white/25 hover:bg-white/10 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
