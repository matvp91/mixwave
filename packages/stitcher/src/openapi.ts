import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "./contract";

export const openApiSpec = generateOpenApi(contract, {
  info: {
    title: "API",
    version: "1.0.0",
  },
});

delete openApiSpec.paths["/spec.json"];
