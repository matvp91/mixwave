import { initClient } from "@ts-rest/core";
import { contract } from "@mixwave/api/client";

export * from "@ts-rest/core";

export * from "@mixwave/api/client";

export { contract };

export const apiClient = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL,
});
