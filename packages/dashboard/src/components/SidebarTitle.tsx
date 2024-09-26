import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SidebarTitleProps = {
  children: ReactNode;
  className?: string;
};

export function SidebarTitle({ children, className }: SidebarTitleProps) {
  return (
    <div className={cn("text-xs px-3 ml-4 font-medium", className)}>
      {children}
    </div>
  );
}
