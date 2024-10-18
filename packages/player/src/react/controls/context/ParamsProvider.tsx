import { createContext } from "react";
import type { ReactNode } from "react";
import type { Lang, Metadata } from "../types";

export type Params = {
  metadata?: Metadata;
  lang?: Lang;
};

export const ParamsContext = createContext<Params>({} as Params);

type ParamsProviderProps = {
  children: ReactNode;
} & Params;

export function ParamsProvider({
  children,
  metadata,
  lang,
}: ParamsProviderProps) {
  return (
    <ParamsContext.Provider value={{ metadata, lang }}>
      {children}
    </ParamsContext.Provider>
  );
}
