import { treaty } from "@elysiajs/eden";
import type { App } from "@superstreamer/api/client";

export type * from "@superstreamer/api/client";

export const api = treaty<App>(window.__ENV__.PUBLIC_API_ENDPOINT);
