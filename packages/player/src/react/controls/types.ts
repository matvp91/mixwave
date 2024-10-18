import { langMap } from "./i18n";

export type Metadata = {
  title?: string;
  subtitle?: string;
};

export type Lang = keyof typeof langMap;
