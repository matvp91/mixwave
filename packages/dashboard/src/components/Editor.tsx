import MonacoEditor from "@monaco-editor/react";
import type { BeforeMount, OnMount } from "@monaco-editor/react";

type EditorProps = {
  schema: object;
  title: React.ReactNode;
  onSave(value: string): void;
};

export function Editor({ schema, title, onSave }: EditorProps) {
  const defaultValue = ["{", '  "uri": ""', "}"].join("\n");

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
        defaultPath="custom"
        theme="vs-dark"
        options={{
          tabSize: 2,
        }}
      />
    </div>
  );
}
