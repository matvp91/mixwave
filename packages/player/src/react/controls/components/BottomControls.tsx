import SettingsIcon from "../icons/settings.svg?react";
import SubtitlesIcon from "../icons/subtitles.svg?react";
import ForwardIcon from "../icons/forward.svg?react";
import { SqButton } from "./SqButton";
import { VolumeButton } from "./VolumeButton";
import { Label } from "./Label";
import { useFacade, useSelector } from "../..";
import { useAppStore } from "../hooks/useAppStore";
import { useFakeTime } from "../hooks/useFakeTime";
import { useSeekTo } from "../hooks/useSeekTo";
import { useShowTextAudio } from "../hooks/useShowTextAudio";
import { PlayPauseButton } from "./PlayPauseButton";
import { FullscreenButton } from "./FullscreenButton";
import type { MouseEventHandler } from "react";
import type { SetAppSettings } from "../hooks/useAppSettings";

type BottomControlsProps = {
  nudgeVisible(): void;
  setAppSettings: SetAppSettings;
  toggleFullscreen: MouseEventHandler<HTMLElement>;
};

export function BottomControls({
  nudgeVisible,
  setAppSettings,
  toggleFullscreen,
}: BottomControlsProps) {
  const facade = useFacade();

  const interstitial = useSelector((facade) => facade.interstitial);
  const volume = useSelector((facade) => facade.volume);

  const settings = useAppStore((state) => state.settings);

  const seekTo = useSeekTo();
  const fakeTime = useFakeTime();
  const showTextAudio = useShowTextAudio();

  return (
    <div className="flex gap-1">
      <PlayPauseButton nudgeVisible={nudgeVisible} />
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
      <Label />
      <div className="grow" />
      {showTextAudio ? (
        <SqButton
          onClick={() => setAppSettings("text-audio")}
          onIdle={() => setAppSettings("text-audio", true)}
          selected={
            settings?.mode === "text-audio" && settings.entry === "explicit"
          }
          data-sprs-settings-action
        >
          <SubtitlesIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
        </SqButton>
      ) : null}
      <SqButton
        onClick={() => setAppSettings("quality")}
        onIdle={() => setAppSettings("quality", true)}
        selected={settings?.mode === "quality" && settings.entry === "explicit"}
        data-sprs-settings-action
      >
        <SettingsIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      </SqButton>
      <FullscreenButton toggleFullscreen={toggleFullscreen} />
    </div>
  );
}
