import { useMemo } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { useTheme } from "@/components/ui/theme-provider";
import { styleLight, styleDark } from "@/lib/syntax-styles";

SyntaxHighlighter.registerLanguage("json", json);

type SyntaxHighlightProps = {
  json: string;
};

export function JsonHighlight({ json }: SyntaxHighlightProps) {
  const { theme } = useTheme();

  const data = useMemo(() => {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, 2);
  }, [json]);

  return (
    <SyntaxHighlighter
      className="rounded-md text-xs border border-border"
      style={theme === "dark" ? styleDark : styleLight}
      language="json"
    >
      {data}
    </SyntaxHighlighter>
  );
}
