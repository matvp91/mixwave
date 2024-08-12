import { lazy } from "react";

const LazyApiReference = lazy(() =>
  import("./ApiReference").then((mod) => ({ default: mod.ApiReference })),
);

export function ApiEmbedPage() {
  return <LazyApiReference />;
}
