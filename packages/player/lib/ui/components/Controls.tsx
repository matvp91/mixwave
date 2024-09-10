import cn from "clsx";
import { Progress } from "./Progress";
import PlayIcon from "../icons/play.svg?react";
import PauseIcon from "../icons/pause.svg?react";
import SettingsIcon from "../icons/settings.svg?react";
import SubtitlesIcon from "../icons/subtitles.svg?react";
import ForwardIcon from "../icons/forward.svg?react";
import { useVisible } from "../hooks/useVisible";
import { Settings } from "./Settings";
import { SqButton } from "./SqButton";
import { useSettings } from "../hooks/useSettings";
import { TimeStat } from "./TimeStat";
import { useTime } from "../hooks/useTime";
import { useState } from "react";
import type { HlsState, HlsFacade } from "../../main";

type ControlsProps = {
  facade: HlsFacade;
  state: HlsState;
};

export function Controls({ facade, state }: ControlsProps) {
  const { visible, elementRef, nudge } = useVisible();
  const [settingsMode, setSettingsMode] = useSettings({
    onChange: () => {
      nudge();
    },
  });
  const [progressSeeking, setProgressSeeking] = useState(false);

  let controlsVisible = visible;
  if (settingsMode || progressSeeking) {
    controlsVisible = true;
  }

  const [time, setTargetTime] = useTime(state.time);

  return (
    <>
      <div
        ref={elementRef}
        className={cn(
          "absolute left-0 bottom-0 w-full opacity-0 transition-opacity z-10 before:absolute before:bg-gradient-to-t before:from-black/50 before:to-transparent before:w-full before:pointer-events-none before:h-[300%] before:-z-10 before:bottom-0",
          controlsVisible && "opacity-100",
        )}
      >
        {showSeekbar(state) ? (
          <div
            className={cn(
              "flex px-4 mb-2 transition-opacity",
              settingsMode !== null && "opacity-0",
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
        ) : null}
        <div className="flex gap-1 px-4 mb-2">
          <SqButton
            onClick={() => {
              facade.playOrPause();
              nudge();
            }}
          >
            {state.playheadState === "play" ? (
              <PauseIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            ) : (
              <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            )}
          </SqButton>
          <SqButton
            onClick={() => {
              facade.seekTo(time + 10);
              nudge();
            }}
          >
            <ForwardIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </SqButton>
          <div className="grow" />
          <SqButton
            onClick={() => setSettingsMode("text-audio")}
            onIdle={() => setSettingsMode("text-audio", true)}
            selected={settingsMode === "text-audio"}
            data-mix-settings-action
          >
            <SubtitlesIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </SqButton>
          <SqButton
            onClick={() => setSettingsMode("quality")}
            onIdle={() => setSettingsMode("quality", true)}
            selected={settingsMode === "quality"}
            data-mix-settings-action
          >
            <SettingsIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </SqButton>
        </div>
      </div>
      <Settings
        facade={facade}
        state={state}
        mode={settingsMode}
        onClose={() => setSettingsMode(null)}
      />
    </>
  );
}

function showSeekbar(state: HlsState) {
  if (state.interstitial && !state.interstitial.seekAllowed) {
    return false;
  }
  return true;
}
