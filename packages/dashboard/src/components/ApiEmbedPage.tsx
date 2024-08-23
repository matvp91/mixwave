import { lazy } from "react";

const LazyOpenApiReference = lazy(() =>
  import("./OpenApiReference").then((mod) => ({
    default: mod.OpenApiReference,
  })),
);

export function ApiEmbedPage() {
  return <LazyOpenApiReference server={import.meta.env.VITE_API_URL} />;
}
