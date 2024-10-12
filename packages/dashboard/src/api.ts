import { treaty } from "@elysiajs/eden";
import type { App } from "@mixwave/api/client";

export type * from "@mixwave/api/client";

export const api = treaty<App>(window.__ENV__.PUBLIC_API_ENDPOINT);
