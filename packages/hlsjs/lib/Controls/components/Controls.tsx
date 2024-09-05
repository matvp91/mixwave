import { useEffect, useState } from "react";
import cn from "clsx";
import { Progress } from "./Progress";
import PlayIcon from "../icons/play.svg?react";
import PauseIcon from "../icons/pause.svg?react";
import SettingsIcon from "../icons/settings.svg?react";
import SubtitlesIcon from "../icons/subtitles.svg?react";
import { useVisible } from "../hooks/useVisible";
import { Settings } from "./Settings";
import { useSettings } from "../hooks/useSettings";
import { SqButton } from "./SqButton";
import type { HlsState, HlsFacade } from "../../main";

type ControlsProps = {
  facade: HlsFacade;
};

export function Controls({ facade }: ControlsProps) {
  const [state, setState] = useState<HlsState>(facade.state);
  const { visible, elementRef } = useVisible();
  const [settingsMode, setSettingsMode] = useSettings();

  useEffect(() => {
    const update = () => setState(facade.state);
    facade.on("*", update);
    return () => {
      facade.off("*", update);
    };
  }, [facade]);

  return (
    <>
      <div
        ref={elementRef}
        className={cn("mix-controls", visible && "mix-controls--visible")}
      >
        {showSeekbar(state) ? (
          <Progress
            state={state}
            onSeeked={(time) => {
              facade.seekTo(time);
            }}
          />
        ) : null}
        <div className="mix-controls-buttons">
          <SqButton onClick={() => facade.playOrPause()}>
            {state.playheadState === "play" ? <PauseIcon /> : <PlayIcon />}
          </SqButton>
          <div className="mix-controls-gutter" />
          <SqButton
            onClick={() => setSettingsMode("text-audio")}
            selected={settingsMode === "text-audio"}
          >
            <SubtitlesIcon />
          </SqButton>
          <SqButton
            onClick={() => setSettingsMode("quality")}
            selected={settingsMode === "quality"}
          >
            <SettingsIcon />
          </SqButton>
        </div>
      </div>
      <Settings facade={facade} state={state} mode={settingsMode} />
    </>
  );
}

function showSeekbar(state: HlsState) {
  if (state.interstitial && !state.interstitial.seekAllowed) {
    return false;
  }
  return true;
}
