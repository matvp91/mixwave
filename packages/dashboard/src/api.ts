import { treaty } from "@elysiajs/eden";
import type { App } from "@mixwave/api/client";

export type * from "@mixwave/api/client";

// See https://tezos.stackexchange.com/questions/6380/elysia-eden-treaty-types-error
// @ts-expect-error
export const api = treaty<App>(window.__ENV__.PUBLIC_API_ENDPOINT);
