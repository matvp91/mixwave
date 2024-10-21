import MonacoEditor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import type { BeforeMount, OnChange, OnMount } from "@monaco-editor/react";

type EditorProps = {
  schema: object;
  title: React.ReactNode;
  onSave(value: string): void;
  localStorageKey?: string;
};

export function Editor({
  schema,
  title,
  onSave,
  localStorageKey,
}: EditorProps) {
  const [defaultValue] = useState(() => {
    const localStorageValue = localStorageKey
      ? localStorage.getItem(localStorageKey)
      : null;
    return localStorageValue
      ? JSON.parse(localStorageValue)
      : ["{", '  "uri": ""', "}"].join("\n");
  });

  useEffect(() => {}, [localStorageKey]);

  const beforeMount: BeforeMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: "http://superstreamer-schema.org/stitcher/session",
          fileMatch: ["custom"],
          schema,
        },
      ],
    });
  };

  const onMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const value = editor.getValue();
      onSave(value);
    });
  };

  const onChange: OnChange = (value) => {
    if (value && localStorageKey) {
      localStorage.setItem(localStorageKey, JSON.stringify(value));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex h-14 items-center border-b px-4">{title}</div>
      <div className="grow relative">
        <MonacoEditor
          className="absolute inset-0"
          defaultLanguage="json"
          defaultValue={defaultValue}
          beforeMount={beforeMount}
          onMount={onMount}
          onChange={onChange}
          defaultPath="custom"
          options={{
            wordWrap: "on",
            minimap: {
              enabled: false,
            },
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
