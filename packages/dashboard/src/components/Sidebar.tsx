import logoMascotte from "../assets/logo-mascotte.png";
import { SidebarTitle } from "./SidebarTitle";
import { Link } from "react-router-dom";
import Rows3 from "lucide-react/icons/rows-3";
import Sailboat from "lucide-react/icons/sailboat";
import Play from "lucide-react/icons/play";
import Box from "lucide-react/icons/box";
import { SidebarNavLink } from "./SidebarNavLink";

export function Sidebar() {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoMascotte} className="w-6" />
          <div className="relative">
            <span className="font-medium text-sm">Superstreamer</span>
            <span className="absolute top-0 text-[10px] ml-[2px]">
              {__VERSION__}
            </span>
          </div>
        </Link>
      </div>
      <div className="flex-1">
        <SidebarTitle className="mb-4 mt-2">Manage</SidebarTitle>
        <nav className="grid items-start px-4 text-sm font-medium mb-4">
          <SidebarNavLink to="/jobs">
            <Rows3 className="h-4 w-4" />
            Jobs
          </SidebarNavLink>
          <SidebarNavLink to="/storage">
            <Box className="h-4 w-4" />
            Storage
          </SidebarNavLink>
        </nav>
        <SidebarTitle className="my-4">Tools</SidebarTitle>
        <nav className="grid items-start px-4 text-sm font-medium">
          <SidebarNavLink to="/player">
            <Play className="h-4 w-4" />
            Player
          </SidebarNavLink>
          <SidebarNavLink to="/api">
            <Sailboat className="h-4 w-4" />
            API
          </SidebarNavLink>
        </nav>
      </div>
    </div>
  );
}
