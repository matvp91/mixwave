import { cn } from "@/lib/utils";
import "ldrs/cardio";

// Default values shown

type StretchLoaderProps = {
  className?: string;
};

export function StretchLoader({ className }: StretchLoaderProps) {
  return (
    <div className={cn("flex justify-center items-center min-h-44", className)}>
      {/* @ts-expect-error */}
      <l-cardio size="50" stroke="4" speed="2" color="#7600ff"></l-cardio>
    </div>
  );
}
