import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

import "./worker";

const uri = monaco.Uri.parse("mixwave/body.json");
const model = monaco.editor.createModel(["{", "", "}"].join("\n"), "json", uri);

type EditorProps = {
  schema?: object;
  title: React.ReactNode;
  onSave(value: string): void;
};

export function Editor({ schema, title, onSave }: EditorProps) {
  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const ref = useRef(null);

  useEffect(() => {
    const editor = monaco.editor.create(ref.current!, {
      theme: "vs-dark",
      language: "json",
      tabSize: 2,
      automaticLayout: true,
    });

    editor.setModel(model);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const value = editor.getValue();
      onSave(value);
    });

    setEditor(editor);

    return () => {
      editor.dispose();
    };
  }, []);

  useEffect(() => {
    if (!schema) {
      return;
    }

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: "http://mixwave/common.json",
          fileMatch: ["mixwave/body.json"],
          schema,
        },
      ],
    });
  }, [schema]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="p-4 flex gap-2">
        <div className="text-white flex items-center">{title}</div>
        <div className="grow" />
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            editor?.getAction("editor.action.formatDocument")?.run();
          }}
        >
          Format
        </Button>
      </div>
      <div ref={ref} className="h-full" />
    </div>
  );
}
