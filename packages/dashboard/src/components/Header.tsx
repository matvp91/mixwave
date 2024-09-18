import logo from "../assets/logo.svg";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const { pathname } = useLocation();

  return (
    <div className="p-4 border-b border-border flex h-16">
      <Link to="/" className="flex items-center">
        <img src={logo} className="w-[24px]" />
      </Link>
      <div className="flex items-center gap-8 ml-8">
        <Link
          to="/api"
          className={cn(
            "text-muted-foreground",
            pathname.startsWith("/api") && "text-black",
          )}
        >
          API
        </Link>
        <Link
          to="/jobs"
          className={cn(
            "text-muted-foreground",
            pathname.startsWith("/jobs") && "text-black",
          )}
        >
          Jobs
        </Link>
        <Link
          to="/player"
          className={cn(
            "text-muted-foreground",
            pathname.startsWith("/player") && "text-black",
          )}
        >
          Player
        </Link>
      </div>
    </div>
  );
}
