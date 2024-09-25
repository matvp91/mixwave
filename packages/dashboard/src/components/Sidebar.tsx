import logo from "../assets/logo.svg";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <div className="p-4">
      <Link to="/" className="flex items-center">
        <img src={logo} className="w-12" />
      </Link>

      <div className="mb-1">Main</div>
      <ul className="ml-1 mb-4">
        <li>
          <Link
            to="/jobs"
            className={cn(
              "text-muted-foreground",
              pathname.startsWith("/jobs") && "text-black",
            )}
          >
            Jobs
          </Link>
        </li>
      </ul>
      <div className="mb-1">Tools</div>
      <ul className="ml-1">
        <li>
          <Link
            to="/api"
            className={cn(
              "text-muted-foreground",
              pathname.startsWith("/api") && "text-black",
            )}
          >
            API
          </Link>
        </li>
        <li>
          <Link
            to="/player"
            className={cn(
              "text-muted-foreground",
              pathname.startsWith("/player") && "text-black",
            )}
          >
            Player
          </Link>
        </li>
      </ul>
    </div>
  );
}
