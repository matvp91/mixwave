import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export function ApiReference() {
  return (
    <ApiReferenceReact
      configuration={{
        hideDownloadButton: true,
        withDefaultFonts: false,
        spec: {
          url: `${import.meta.env.VITE_API_URL}/spec.json`,
        },
        servers: [
          {
            description: "Main",
            url: `${import.meta.env.VITE_API_URL}`,
          },
        ],
      }}
    />
  );
}
