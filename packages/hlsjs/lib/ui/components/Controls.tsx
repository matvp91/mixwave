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

  let controlsVisible = visible;
  if (settingsMode) {
    controlsVisible = true;
  }

  const [time, setTargetTime] = useTime(state.time);

  return (
    <>
      <div
        ref={elementRef}
        className={cn(
          "mix-controls",
          controlsVisible && "mix-controls--visible",
        )}
      >
        {showSeekbar(state) ? (
          <div className="mix-controls-progress">
            <div className="mix-controls-progress-container">
              <Progress
                time={time}
                state={state}
                onSeeked={(time) => {
                  setTargetTime(time);
                  facade.seekTo(time);
                }}
              />
            </div>
            <TimeStat time={time} state={state} />
          </div>
        ) : null}
        <div className="mix-controls-bottom">
          <SqButton
            onClick={() => {
              facade.playOrPause();
              nudge();
            }}
          >
            {state.playheadState === "play" ? <PauseIcon /> : <PlayIcon />}
          </SqButton>
          <SqButton
            onClick={() => {
              facade.seekTo(time + 10);
              nudge();
            }}
          >
            <ForwardIcon />
          </SqButton>
          <div className="mix-controls-gutter" />
          <SqButton
            onClick={() => setSettingsMode("text-audio")}
            selected={settingsMode === "text-audio"}
            data-settings-action
          >
            <SubtitlesIcon />
          </SqButton>
          <SqButton
            onClick={() => setSettingsMode("quality")}
            selected={settingsMode === "quality"}
            data-settings-action
          >
            <SettingsIcon />
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
