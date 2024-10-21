import { Storage } from "@/components/Storage";
import { Navigate, useSearchParams } from "react-router-dom";

export function StoragePage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path");

  if (!path) {
    return <Navigate to="?path=/" />;
  }

  return <Storage path={path} />;
}
