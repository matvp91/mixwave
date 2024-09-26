import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Editor } from "@/components/editor/Editor";
import { Player } from "@/components/player/Player";
import { Loader } from "@/components/Loader";

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

  if (!schema) {
    return <Loader className="min-h-44" />;
  }

  return (
    <div className="min-h-full flex grow">
      <div className="basis-1/2 min-w-0">
        <Editor
          schema={schema}
          title={
            <div className="flex gap-2 text-xs">
              <span className="font-bold">POST</span>
              {import.meta.env.VITE_STITCHER_URL}/session
            </div>
          }
          onSave={onSave}
        />
      </div>
      <div className="basis-1/2 p-4">
        {masterUrl ? (
          <>
            <Player url={masterUrl} />
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
  );
}
