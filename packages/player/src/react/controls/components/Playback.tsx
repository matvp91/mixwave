import cn from "clsx";
import { Progress } from "./Progress";
import { SlotProgress } from "./SlotProgress";
import { Settings } from "./Settings";
import { TimeStat } from "./TimeStat";
import { Center } from "./Center";
import { BottomControls } from "./BottomControls";
import { useAppVisible } from "../hooks/useAppVisible";
import { useAppStore } from "../AppStoreProvider";
import { useAppSettings } from "../hooks/useAppSettings";
import { useFacade, useSelector } from "../..";
import { useAppFullscreen } from "../hooks/useAppFullscreen";
import { useFakeTime } from "../hooks/useFakeTime";
import type { Metadata } from "../types";

type PlaybackProps = {
  metadata?: Metadata;
};

export function Playback({ metadata }: PlaybackProps) {
  const [ref, nudgeVisible] = useAppVisible();
  const setAppSettings = useAppSettings();
  const toggleFullscreen = useAppFullscreen();

  const visible = useAppStore((state) => state.visible);
  const settings = useAppStore((state) => state.settings);
  const seeking = useAppStore((state) => state.seeking);

  const facade = useFacade();
  const interstitial = useSelector((facade) => facade.interstitial);
  const started = useSelector((facade) => facade.started);

  const fakeTime = useFakeTime();

  let visibleControls = false;
  if (started && (visible || settings || seeking)) {
    visibleControls = true;
  }

  const setTargetTime = useAppStore((state) => state.setTargetTime);

  const seekTo = (targetTime: number) => {
    facade.seekTo(targetTime);
    setTargetTime(targetTime);
  };

  return (
    <>
      <div
        ref={ref}
        className={cn(
          "absolute left-0 bottom-0 w-full opacity-0 transition-opacity z-40 before:absolute before:bg-gradient-to-t before:from-black/50 before:to-transparent before:w-full before:pointer-events-none before:h-[300%] before:-z-10 before:bottom-0",
          visibleControls && "opacity-100",
        )}
      >
        <div
          className={cn(
            "relative mb-2 transition-opacity",
            !!settings && "opacity-0 pointer-events-none",
          )}
        >
          {interstitial ? (
            <div className="absolute left-0 right-0 bottom-0 px-4">
              <SlotProgress />
            </div>
          ) : (
            <div className="absolute left-0 right-0 bottom-0 flex items-center px-4">
              <Progress seekTo={seekTo} fakeTime={fakeTime} />
              <TimeStat fakeTime={fakeTime} />
            </div>
          )}
        </div>
        <div className="px-4 mb-2">
          <BottomControls
            nudgeVisible={nudgeVisible}
            fakeTime={fakeTime}
            setAppSettings={setAppSettings}
            metadata={metadata}
            toggleFullscreen={toggleFullscreen}
            seekTo={seekTo}
          />
        </div>
      </div>
      <Settings />
      <Center onDoubleClick={toggleFullscreen} />
    </>
  );
}
