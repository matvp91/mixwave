import PlayIcon from "../icons/play.svg?react";
import PauseIcon from "../icons/pause.svg?react";
import SettingsIcon from "../icons/settings.svg?react";
import SubtitlesIcon from "../icons/subtitles.svg?react";
import ForwardIcon from "../icons/forward.svg?react";
import FullscreenIcon from "../icons/fullscreen.svg?react";
import FullscreenExitIcon from "../icons/fullscreen-exit.svg?react";
import { SqButton } from "./SqButton";
import { VolumeButton } from "./VolumeButton";
import { Label } from "./Label";
import { useFacade, useSelector } from "../..";
import { useAppStore } from "../AppStoreProvider";
import { useFakeTime } from "../hooks/useFakeTime";
import type { MouseEventHandler } from "react";
import type { SetAppSettings } from "../hooks/useAppSettings";
import type { Metadata } from "../types";

type BottomControlsProps = {
  nudgeVisible(): void;
  setAppSettings: SetAppSettings;
  metadata?: Metadata;
  toggleFullscreen: MouseEventHandler<HTMLElement>;
  seekTo(targetTime: number): void;
};

export function BottomControls({
  nudgeVisible,
  setAppSettings,
  metadata,
  toggleFullscreen,
  seekTo,
}: BottomControlsProps) {
  const facade = useFacade();

  const playhead = useSelector((facade) => facade.playhead);
  const interstitial = useSelector((facade) => facade.interstitial);
  const volume = useSelector((facade) => facade.volume);

  const settings = useAppStore((state) => state.settings);
  const fullscreen = useAppStore((state) => state.fullscreen);

  const fakeTime = useFakeTime();

  return (
    <div className="flex gap-1">
      <SqButton
        onClick={() => {
          facade.playOrPause();
          nudgeVisible();
        }}
      >
        {playhead === "play" || playhead === "playing" ? (
          <PauseIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
        ) : (
          <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
        )}
      </SqButton>
      <SqButton
        disabled={interstitial !== null}
        onClick={() => {
          seekTo(fakeTime + 10);
        }}
      >
        <ForwardIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      </SqButton>
      <VolumeButton
        volume={volume}
        setVolume={(volume) => facade.setVolume(volume)}
      />
      <Label metadata={metadata} />
      <div className="grow" />
      <SqButton
        onClick={() => setAppSettings("text-audio")}
        onIdle={() => setAppSettings("text-audio", true)}
        selected={
          settings?.mode === "text-audio" && settings.entry === "explicit"
        }
        data-mix-settings-action
      >
        <SubtitlesIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      </SqButton>
      <SqButton
        onClick={() => setAppSettings("quality")}
        onIdle={() => setAppSettings("quality", true)}
        selected={settings?.mode === "quality" && settings.entry === "explicit"}
        data-mix-settings-action
      >
        <SettingsIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      </SqButton>
      <SqButton onClick={toggleFullscreen}>
        {fullscreen ? (
          <FullscreenExitIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
        ) : (
          <FullscreenIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
        )}
      </SqButton>
    </div>
  );
}
