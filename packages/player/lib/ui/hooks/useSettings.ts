import { useEffect, useState } from "react";

export type SettingsMode = "text-audio" | "quality";

type UseSettingsParams = {
  onChange(): void;
};

export function useSettings({ onChange }: UseSettingsParams) {
  const [settings, setSettings_] = useState<SettingsMode | null>(null);

  const setSettings = (value: SettingsMode | null) => {
    if (value === null) {
      setSettings_(null);
    } else {
      setSettings_((v) => (v !== value ? value : null));
    }
  };

  useEffect(() => {
    onChange();
  }, [settings]);

  return [settings, setSettings] as const;
}
