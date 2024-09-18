import { ApiReferenceReact } from "@scalar/api-reference-react";
import { tsr } from "@/tsr";
import "@scalar/api-reference-react/style.css";

type OpenApiReferenceProps = {
  url: string;
};

export function OpenApiReference({ url }: OpenApiReferenceProps) {
  const { data } = tsr.getSpec.useQuery({
    queryKey: ["spec"],
  });

  if (!data) {
    return null;
  }

  return (
    <ApiReferenceReact
      configuration={{
        hideDownloadButton: true,
        withDefaultFonts: false,
        spec: {
          content: data.body,
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
