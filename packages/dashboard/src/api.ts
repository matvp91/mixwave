import { treaty } from "@elysiajs/eden";
import type { App } from "@mixwave/api/client";

export type * from "@mixwave/api/client";

export const api = treaty<App>(import.meta.env.PUBLIC_API_ENDPOINT);
