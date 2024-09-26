import { initTsrReactQuery } from "@ts-rest/react-query/v5";
import { contract } from "@mixwave/api/client";

export type { JobDto } from "@mixwave/api/client";

export const tsr = initTsrReactQuery(contract, {
  baseUrl: import.meta.env.PUBLIC_API_ENDPOINT,
});
