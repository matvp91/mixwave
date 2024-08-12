import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("max-w-5xl w-full mx-auto px-4", className)}>
      {children}
    </div>
  );
}
