import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

const ringSizeClasses = {
  sm: "w-14 h-14",
  md: "w-20 h-20",
  lg: "w-28 h-28",
  xl: "w-36 h-36",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring */}
        <div
          className={cn(
            "absolute rounded-full border-2 border-primary/30 animate-ping",
            ringSizeClasses[size]
          )}
        />
        {/* Spinning ring */}
        <div
          className={cn(
            "absolute rounded-full border-2 border-transparent border-t-primary animate-spin",
            ringSizeClasses[size]
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
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner size="xl" />
    </div>
  );
}
