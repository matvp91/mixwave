import { StretchLoader } from "@/components/StretchLoader";
import { lazy, Suspense } from "react";
import "@scalar/api-reference-react/style.css";

const LazyOpenApiReference = lazy(() =>
  import("@/components/OpenApiReference").then((mod) => ({
    default: mod.OpenApiReference,
  })),
);

export function ApiPage() {
  return (
    <Suspense fallback={<StretchLoader />}>
      <LazyOpenApiReference url={import.meta.env.VITE_API_URL} />
    </Suspense>
  );
}
