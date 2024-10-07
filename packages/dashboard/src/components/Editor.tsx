import MonacoEditor from "@monaco-editor/react";
import type { BeforeMount, OnChange, OnMount } from "@monaco-editor/react";
import { useEffect, useState } from "react";

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
          uri: "http://mixwave-schema.org/stitcher/session",
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
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="p-4 flex gap-2">
        <div className="text-white flex items-center">{title}</div>
      </div>
      <MonacoEditor
        className="h-full"
        defaultLanguage="json"
        defaultValue={defaultValue}
        beforeMount={beforeMount}
        onMount={onMount}
        onChange={onChange}
        defaultPath="custom"
        theme="vs-dark"
        options={{
          tabSize: 2,
        }}
      />
    </div>
  );
}
