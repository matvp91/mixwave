import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "./contract.js";
import { env } from "./env.js";

export const openApiSpec = generateOpenApi(contract, {
  info: {
    title: "API",
    version: "1.0.0",
  },
  servers: [
    {
      url: env.PUBLIC_API_ENDPOINT,
      description: "Public",
    },
  ],
});

delete openApiSpec.paths["/spec.json"];
