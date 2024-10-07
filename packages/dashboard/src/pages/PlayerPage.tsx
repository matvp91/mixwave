import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Editor } from "@/components/Editor";
import { Player } from "@/components/Player";
import { Loader } from "@/components/Loader";
import TvMinimalPlay from "lucide-react/icons/tv-minimal-play";

export function PlayerPage() {
  const [schema, setSchema] = useState<object>();
  const [masterUrl, setMasterUrl] = useState<string>();
  const [error, setError] = useState<object>();

  useEffect(() => {
    fetch(`${import.meta.env.PUBLIC_STITCHER_ENDPOINT}/spec.json`)
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
      `${import.meta.env.PUBLIC_STITCHER_ENDPOINT}/session`,
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
          localStorageKey="mixPlayerEditorValue"
          schema={schema}
          title={
            <div className="flex gap-2 text-xs">
              <span className="font-bold">POST</span>
              {import.meta.env.PUBLIC_STITCHER_ENDPOINT}/session
            </div>
          }
          onSave={onSave}
        />
      </div>
      <div className="basis-1/2 p-4">
        {masterUrl ? (
          <>
            <Player url={masterUrl} />
            <div className="relative">
              <TvMinimalPlay className="w-4 h-4 absolute left-3 top-3" />
              <Input
                className="mt-2 pl-9"
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
