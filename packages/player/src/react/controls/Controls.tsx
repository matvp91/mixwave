import { Playback } from "./components/Playback";
import { Start } from "./components/Start";
import { AppStoreProvider } from "./context/AppStoreProvider";
import { ParamsProvider } from "./context/ParamsProvider";
import type { Lang, Metadata } from "./types";

export type ControlsProps = {
  metadata?: Metadata;
  lang?: Lang;
};

export function Controls({ metadata, lang }: ControlsProps) {
  return (
    <AppStoreProvider>
      <ParamsProvider metadata={metadata} lang={lang}>
        <Start />
        <Playback />
      </ParamsProvider>
    </AppStoreProvider>
  );
}
