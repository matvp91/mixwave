import { Playback } from "./components/Playback";
import { Start } from "./components/Start";
import { AppStoreProvider } from "./AppStoreProvider";
import type { Metadata } from "./types";

export type ControlsProps = {
  metadata?: Metadata;
};

export function Controls({ metadata }: ControlsProps) {
  return (
    <AppStoreProvider>
      <Start />
      <Playback metadata={metadata} />
    </AppStoreProvider>
  );
}
