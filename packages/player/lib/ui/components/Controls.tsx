import cn from "clsx";
import { Progress } from "./Progress";
import { SlotProgress } from "./SlotProgress";
import PlayIcon from "../icons/play.svg?react";
import PauseIcon from "../icons/pause.svg?react";
import SettingsIcon from "../icons/settings.svg?react";
import SubtitlesIcon from "../icons/subtitles.svg?react";
import ForwardIcon from "../icons/forward.svg?react";
import FullscreenIcon from "../icons/fullscreen.svg?react";
import FullscreenExitIcon from "../icons/fullscreen-exit.svg?react";
import { useVisible } from "../hooks/useVisible";
import { Settings } from "./Settings";
import { SqButton } from "./SqButton";
import { SettingsMode, useSettings } from "../hooks/useSettings";
import { TimeStat } from "./TimeStat";
import { useTime } from "../hooks/useTime";
import { useState } from "react";
import { Center } from "./Center";
import { Label } from "./Label";
import { useFullscreen } from "../hooks/useFullscreen";
import { VolumeButton } from "./VolumeButton";
import type { State, HlsFacade } from "../..";
import type { Metadata } from "../types";

type ControlsProps = {
  facade: HlsFacade;
  state: State;
  metadata?: Metadata;
};

export function Controls({ facade, state, metadata }: ControlsProps) {
  const { visible, elementRef, nudge } = useVisible();
  const [settings, setSettings] = useSettings();
  const [progressSeeking, setProgressSeeking] = useState(false);
  const fullscreen = useFullscreen();

  let controlsVisible = visible;
  if (settings || progressSeeking) {
    controlsVisible = true;
  }

  const [time, setTargetTime] = useTime(state);

  return (
    <>
      <div
        ref={elementRef}
        className={cn(
          "absolute left-0 bottom-0 w-full opacity-0 transition-opacity z-40 before:absolute before:bg-gradient-to-t before:from-black/50 before:to-transparent before:w-full before:pointer-events-none before:h-[300%] before:-z-10 before:bottom-0",
          controlsVisible && "opacity-100",
        )}
      >
        <div
          className={cn(
            "flex px-4 mb-2 transition-opacity",
            !showSeekbar(state, settings?.mode) &&
              "opacity-0 pointer-events-none",
          )}
        >
          <Progress
            time={time}
            state={state}
            seeking={progressSeeking}
            setSeeking={setProgressSeeking}
            onSeeked={(time) => {
              nudge();
              setTargetTime(time);
              facade.seekTo(time);
            }}
          />
          <TimeStat time={time} state={state} />
        </div>
        {state.slot ? (
          <div
            className={cn(
              "flex px-4 mb-2 transition-opacity",
              settings !== null && "opacity-0",
            )}
          >
            <SlotProgress slot={state.slot} />
          </div>
        ) : null}
        <div className="flex gap-1 px-4 mb-2">
          <SqButton
            onClick={() => {
              facade.playOrPause();
              nudge();
            }}
          >
            {state.playheadState === "play" ? (
              <PauseIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
            ) : (
              <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
            )}
          </SqButton>
          {showSeekbar(state) ? (
            <SqButton
              onClick={() => {
                facade.seekTo(time + 10);
                nudge();
              }}
            >
              <ForwardIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
            </SqButton>
          ) : null}
          <VolumeButton />
          <Label slot={state.slot} metadata={metadata} />
          <div className="grow" />
          <SqButton
            onClick={() => setSettings("text-audio")}
            onIdle={() => setSettings("text-audio", true)}
            selected={
              settings?.mode === "text-audio" && settings.entry === "explicit"
            }
            data-mix-settings-action
          >
            <SubtitlesIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
          </SqButton>
          <SqButton
            onClick={() => setSettings("quality")}
            onIdle={() => setSettings("quality", true)}
            selected={
              settings?.mode === "quality" && settings.entry === "explicit"
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
      </div>
      <Settings
        facade={facade}
        state={state}
        mode={settings ? settings.mode : null}
      />
      <Center facade={facade} onFullscreenClick={fullscreen?.onClick} />
    </>
  );
}

function showSeekbar(state: State, settings?: SettingsMode) {
  if (settings) {
    return false;
  }
  if (state.slot) {
    return false;
  }
  return true;
}
