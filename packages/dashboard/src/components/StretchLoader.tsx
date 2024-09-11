import { cn } from "@/lib/utils";
import Loader from "lucide-react/icons/loader";

// Default values shown

type StretchLoaderProps = {
  className?: string;
};

export function StretchLoader({ className }: StretchLoaderProps) {
  return (
    <div className={cn("flex justify-center items-center min-h-44", className)}>
      <Loader className="animate-spin" />
    </div>
  );
}
