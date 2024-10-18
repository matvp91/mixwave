import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Editor } from "@/components/Editor";
import { Loader } from "@/components/Loader";
import { PlayerView } from "@/components/PlayerView";

export function PlayerPage() {
  const [schema, setSchema] = useState<object>();
  const [masterUrl, setMasterUrl] = useState<string>();
  const [error, setError] = useState<object>();

  useEffect(() => {
    fetch(`${window.__ENV__.PUBLIC_STITCHER_ENDPOINT}/swagger/json`)
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

    const response = await fetch(
      `${window.__ENV__.PUBLIC_STITCHER_ENDPOINT}/session`,
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
              {window.__ENV__.PUBLIC_STITCHER_ENDPOINT}/session
            </div>
          }
          onSave={onSave}
        />
      </div>
      <div className="basis-1/2">
        {error ? (
          <div className="p-4">
            <Alert variant="destructive" className="text-xs">
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </Alert>
          </div>
        ) : null}
        <PlayerView masterUrl={masterUrl} />
      </div>
    </div>
  );
}
