import cn from "clsx";
import { Settings } from "./Settings";
import { Center } from "./Center";
import { BottomControls } from "./BottomControls";
import { useAppVisible } from "../hooks/useAppVisible";
import { useAppSettings } from "../hooks/useAppSettings";
import { useAppFullscreen } from "../hooks/useAppFullscreen";
import { useVisibleControls } from "../hooks/useVisibleControls";
import { Seekbar } from "./Seekbar";
import type { Metadata } from "../types";

type PlaybackProps = {
  metadata?: Metadata;
};

export function Playback({ metadata }: PlaybackProps) {
  const [ref, nudgeVisible] = useAppVisible();
  const setAppSettings = useAppSettings();
  const toggleFullscreen = useAppFullscreen();
  const visibleControls = useVisibleControls();

  return (
    <>
      <div
        ref={ref}
        className={cn(
          "absolute left-0 bottom-0 w-full opacity-0 transition-opacity z-40 before:absolute before:bg-gradient-to-t before:from-black/50 before:to-transparent before:w-full before:pointer-events-none before:h-[300%] before:-z-10 before:bottom-0",
          visibleControls && "opacity-100",
        )}
      >
        <Seekbar />
        <div className="px-4 mb-2">
          <BottomControls
            nudgeVisible={nudgeVisible}
            setAppSettings={setAppSettings}
            metadata={metadata}
            toggleFullscreen={toggleFullscreen}
          />
        </div>
      </div>
      <Settings />
      <Center onDoubleClick={toggleFullscreen} />
    </>
  );
}
