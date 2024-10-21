import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SidebarNavLinkProps = {
  children: ReactNode;
  to: string;
};

export function SidebarNavLink({ children, to }: SidebarNavLinkProps) {
  const { pathname } = useLocation();

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",

        pathname.startsWith(to) && "bg-muted text-primary",
      )}
    >
      {children}
    </Link>
  );
}
