import { useState } from "react";

export type SettingsMode = "text-audio" | "quality";

export function useSettings() {
  const [settings, setSettings_] = useState<SettingsMode | null>(null);

  const setSettings = (value: SettingsMode) => {
    setSettings_((v) => (v !== value ? value : null));
  };

  return [settings, setSettings] as const;
}
