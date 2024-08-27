import { lazy } from "react";

const LazyOpenApiReference = lazy(() =>
  import("@/components/OpenApiReference").then((mod) => ({
    default: mod.OpenApiReference,
  })),
);

export function ApiEmbedPage() {
  return <LazyOpenApiReference url={import.meta.env.VITE_API_URL} />;
}
