import { useMemo } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import style from "react-syntax-highlighter/dist/esm/styles/hljs/stackoverflow-light";

style["hljs"].padding = "1rem";
delete style["hljs"].background;

SyntaxHighlighter.registerLanguage("json", json);

type SyntaxHighlightProps = {
  json: string;
};

export function JsonHighlight({ json }: SyntaxHighlightProps) {
  const data = useMemo(() => {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, 2);
  }, [json]);

  return (
    <SyntaxHighlighter
      className="rounded-md text-xs border border-border"
      style={style}
      language="json"
    >
      {data}
    </SyntaxHighlighter>
  );
}
