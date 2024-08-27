import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

type OpenApiReferenceProps = {
  url: string;
};

export function OpenApiReference({ url }: OpenApiReferenceProps) {
  return (
    <ApiReferenceReact
      configuration={{
        hideDownloadButton: true,
        withDefaultFonts: false,
        spec: {
          url: `${url}/spec.json`,
        },
        servers: [
          {
            description: "Main",
            url: `${url}`,
          },
        ],
      }}
    />
  );
}
