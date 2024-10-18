type OverrideMap = Partial<{ [key in LangKey]: string }>;

export type LangKey = keyof typeof defaultLangMap;

export const defaultLangMap = {
  "button.play": "Play",
  "button.pause": "Pause",
  "button.fullscreen": "Fullscreen",
  "button.exit-fullscreen": "Exit fullscreen",
  "settings.quality.title": "Quality",
  "settings.quality.auto": "Auto",
  "settings.subtitle.none": "None",
  "settings.subtitle.title": "Subtitles",
  "settings.audio.title": "Audio",
} as const;

export const langMap: Record<"eng" | "nld", OverrideMap> = {
  eng: defaultLangMap,
  nld: {
    "button.play": "Afspelen",
    "button.pause": "Pauseren",
    "settings.quality.title": "Kwaliteit",
    "settings.subtitle.none": "Geen",
    "settings.subtitle.title": "Ondertitels",
  },
} as const;
