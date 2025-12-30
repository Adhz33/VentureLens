import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
};

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative">
        {/* Pulsing ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-primary/30 animate-ping",
            sizeClasses[size]
          )}
        />
        {/* Spinning ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin",
            sizeClasses[size]
          )}
        />
        {/* Logo */}
        <img
          src={logo}
          alt="VentureLens"
          className={cn(
            "relative z-10 animate-pulse",
            sizeClasses[size]
          )}
        />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}
