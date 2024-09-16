import { useEffect, useState, lazy, Suspense } from "react";
import { Player } from "@/components/player/Player";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { BrowserMockup } from "@/components/BrowserMockup";
import { StretchLoader } from "@/components/StretchLoader";

const LazyEditor = lazy(() =>
  import("@/components/editor/Editor").then((mod) => ({ default: mod.Editor })),
);

const LazyPlayer = lazy(() =>
  import("@/components/player/Player").then((mod) => ({ default: mod.Player })),
);

export function PlayerPage() {
  const [schema, setSchema] = useState<object>();
  const [masterUrl, setMasterUrl] = useState<string>();
  const [error, setError] = useState<object>();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_STITCHER_URL}/spec.json`)
      .then((response) => response.json())
      .then((data) => {
        setSchema(
          data.paths["/session"].post.requestBody.content["application/json"]
            .schema,
        );
      });
  }, []);

  const onSave = async (body: string) => {
    setError(undefined);
    setMasterUrl(undefined);

    const response = await fetch(
      `${import.meta.env.VITE_STITCHER_URL}/session`,
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      },
    );

    const data = await response.json();

    if (response.ok) {
      setMasterUrl(data.url);
    } else {
      setError(data);
    }
  };

  return (
    <Suspense fallback={<StretchLoader />}>
      <div className="min-h-full flex grow">
        <div className="basis-1/2 min-w-0">
          <LazyEditor
            schema={schema}
            title={
              <div className="text-xs">
                <span className="font-bold bg-white/20 py-1 px-2 mr-1 rounded-md">
                  POST
                </span>{" "}
                {import.meta.env.VITE_STITCHER_URL}/session
              </div>
            }
            onSave={onSave}
          />
        </div>
        <div className="basis-1/2 p-4">
          {masterUrl ? (
            <>
              <BrowserMockup>
                <LazyPlayer url={masterUrl} />
              </BrowserMockup>
              <div className="mt-4">
                <Label>Playlist URL</Label>
                <Input
                  value={masterUrl}
                  onClick={(event) => {
                    (event.target as HTMLInputElement).select();
                  }}
                  onChange={() => {}}
                />
              </div>
            </>
          ) : null}
          {error ? (
            <Alert variant="destructive" className="text-xs">
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </Alert>
          ) : null}
        </div>
      </div>
    </Suspense>
  );
}
