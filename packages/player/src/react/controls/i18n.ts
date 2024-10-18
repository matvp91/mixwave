type OverrideMap = Partial<{ [key in LangKey]: string }>;

export type LangKey = keyof typeof defaultLangMap;

export const defaultLangMap = {
  play: "Play",
  pause: "Pause",
  fullscreen: "Fullscreen",
  exitFullscreen: "Exit fullscreen",
} as const;

export const langMap: Record<"eng" | "nld", OverrideMap> = {
  eng: defaultLangMap,
  nld: {
    play: "Afspelen",
    pause: "Pauseren",
  },
} as const;
