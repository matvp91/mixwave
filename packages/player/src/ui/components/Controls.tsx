import cn from "clsx";
import { Progress } from "./Progress";
import { SlotProgress } from "./SlotProgress";
import { useVisible } from "../hooks/useVisible";
import { Settings } from "./Settings";
import { useSettings } from "../hooks/useSettings";
import { TimeStat } from "./TimeStat";
import { useTime } from "../hooks/useTime";
import { useState } from "react";
import { Center } from "./Center";
import { useFullscreen } from "../hooks/useFullscreen";
import { BottomControls } from "./BottomControls";
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

  let isVisible = controlsVisible;
  if (!state.isStarted) {
    isVisible = false;
  }

  return (
    <>
      <div
        ref={elementRef}
        className={cn(
          "absolute left-0 bottom-0 w-full opacity-0 transition-opacity z-40 before:absolute before:bg-gradient-to-t before:from-black/50 before:to-transparent before:w-full before:pointer-events-none before:h-[300%] before:-z-10 before:bottom-0",
          isVisible && "opacity-100",
        )}
      >
        <div
          className={cn(
            "relative mb-2 transition-opacity",
            !!settings && "opacity-0 pointer-events-none",
          )}
        >
          {state.slot ? (
            <div className="absolute left-0 right-0 bottom-0 px-4">
              <SlotProgress slot={state.slot} />
            </div>
          ) : (
            <div className="absolute left-0 right-0 bottom-0 flex items-center px-4">
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
          )}
        </div>
        <div className="px-4 mb-2">
          <BottomControls
            metadata={metadata}
            facade={facade}
            state={state}
            setSettings={setSettings}
            time={time}
            fullscreen={fullscreen}
            nudge={nudge}
            settings={settings}
          />
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
