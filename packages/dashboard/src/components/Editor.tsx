import MonacoEditor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ui/theme-provider";
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
  const { theme } = useTheme();
  const style = useMonacoStyle();

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
    <div className="h-full flex flex-col">
      <div
        className="border-b flex px-4"
        style={{ height: "calc(3.5rem + 4px)" }}
      >
        <div className="flex items-center">{title}</div>
      </div>
      <div className="h-full relative">
        {style}
        <MonacoEditor
          className="absolute inset-0"
          defaultLanguage="json"
          defaultValue={defaultValue}
          beforeMount={beforeMount}
          onMount={onMount}
          onChange={onChange}
          defaultPath="custom"
          theme={theme === "dark" ? "vs-dark" : "light"}
          options={{
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

function useMonacoStyle() {
  const { theme } = useTheme();

  if (theme === "dark") {
    return (
      <style>{`
       .monaco-editor, .monaco-editor-background { background-color: inherit; }
       .monaco-editor .margin { background-color: inherit; }  
    `}</style>
    );
  }

  return null;
}
