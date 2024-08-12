import logo from "../assets/logo.svg";
import logoText from "../assets/logo-text.svg";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export function Header() {
  const { pathname } = useLocation();

  return (
    <div className="p-4 border-b border-border flex h-16">
      <Link to="/" className="flex gap-2 items-center">
        <img src={logo} className="w-[24px]" />
        <img src={logoText} className="w-[60px]" />
      </Link>
      <div className="flex gap-2 ml-4">
        <Button
          asChild
          variant={pathname.startsWith("/jobs") ? "secondary" : "link"}
          className="h-8"
        >
          <Link to="/jobs">jobs</Link>
        </Button>
        <Button
          asChild
          variant={pathname.startsWith("/api") ? "secondary" : "link"}
          className="h-8"
        >
          <Link to="/api">api</Link>
        </Button>
      </div>
    </div>
  );
}
