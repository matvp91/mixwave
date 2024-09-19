import { OpenApiReference } from "@/components/OpenApiReference";
import "@scalar/api-reference-react/style.css";

export function ApiPage() {
  return <OpenApiReference url={import.meta.env.VITE_API_URL} />;
}
