import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export function ApiPage() {
  return (
    <div className="absolute inset-0 top-16 overflow-y-auto">
      <ApiReferenceReact
        configuration={{
          hideDownloadButton: true,
          withDefaultFonts: false,
          spec: {
            url: `${import.meta.env.VITE_API_URL}/spec.json`,
          },
          servers: [
            {
              description: "hello",
              url: `${import.meta.env.VITE_API_URL}`,
            },
          ],
        }}
      />
    </div>
  );
}
