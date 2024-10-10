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
import { useUiContext } from "./UiContext";

export function BottomControls() {
  const {
    visible,
    facade,
    state,
    settings,
    metadata,
    time,
    fullscreen,
    seekTo,
  } = useUiContext();

  return (
    <div className="flex gap-1">
      <SqButton
        onClick={() => {
          facade.playOrPause();
          visible.nudge();
        }}
      >
        {state.playheadState === "play" ? (
          <PauseIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
        ) : (
          <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
        )}
      </SqButton>
      <SqButton
        disabled={state.slot !== null}
        onClick={() => {
          seekTo(time + 10);
        }}
      >
        <ForwardIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      </SqButton>
      <VolumeButton
        volume={state.volume}
        setVolume={(volume) => facade.setVolume(volume)}
      />
      <Label slot={state.slot} metadata={metadata} />
      <div className="grow" />
      <SqButton
        onClick={() => settings.set("text-audio")}
        onIdle={() => settings.set("text-audio", true)}
        selected={
          settings.value?.mode === "text-audio" &&
          settings.value.entry === "explicit"
        }
        data-mix-settings-action
      >
        <SubtitlesIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      </SqButton>
      <SqButton
        onClick={() => settings.set("quality")}
        onIdle={() => settings.set("quality", true)}
        selected={
          settings.value?.mode === "quality" &&
          settings.value.entry === "explicit"
        }
        data-mix-settings-action
      >
        <SettingsIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      </SqButton>
      {fullscreen ? (
        <SqButton onClick={fullscreen.onClick}>
          {fullscreen.active ? (
            <FullscreenExitIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
          ) : (
            <FullscreenIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
          )}
        </SqButton>
      ) : null}
    </div>
  );
}
