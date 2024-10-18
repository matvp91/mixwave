import { SelectObject } from "@/components/SelectObject";
import { useNavigate, useParams } from "react-router-dom";

export function ApiPage() {
  const navigate = useNavigate();
  const { service = "api" } = useParams() as {
    service?: string;
  };

  const baseUrl = {
    api: window.__ENV__.PUBLIC_API_ENDPOINT,
    stitcher: window.__ENV__.PUBLIC_STITCHER_ENDPOINT,
  }[service];

  return (
    <>
      <div className="h-14 border-b flex px-4">
        <div className="flex gap-2 h-14 items-center w-full">
          <span className="text-sm">Service</span>
          <SelectObject
            items={[
              {
                label: "API",
                value: "api",
              },
              {
                label: "Stitcher API",
                value: "stitcher",
              },
            ]}
            value={service}
            onChange={(value) => {
              navigate(value === "api" ? "/api" : `/api/${value}`);
            }}
          />
        </div>
      </div>
      <iframe className="w-full h-full" src={`${baseUrl}/swagger`} />
    </>
  );
}
