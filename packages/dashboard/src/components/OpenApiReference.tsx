import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

type OpenApiReferenceProps = {
  server: string;
};

export function OpenApiReference({ server }: OpenApiReferenceProps) {
  return (
    <ApiReferenceReact
      configuration={{
        hideDownloadButton: true,
        withDefaultFonts: false,
        spec: {
          url: `${server}/spec.json`,
        },
        servers: [
          {
            description: "Server",
            url: `${server}`,
          },
        ],
      }}
    />
  );
}
