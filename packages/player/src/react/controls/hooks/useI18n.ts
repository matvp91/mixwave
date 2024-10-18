import { useCallback, useContext } from "react";
import { langMap, defaultLangMap } from "../i18n";
import { ParamsContext } from "../context/ParamsProvider";
import type { LangKey } from "../i18n";

export function useI18n() {
  const { lang } = useContext(ParamsContext);

  const getText = useCallback(
    (key: LangKey) => langMap[lang ?? "eng"][key] ?? defaultLangMap[key],
    [lang, langMap],
  );

  return getText;
}
