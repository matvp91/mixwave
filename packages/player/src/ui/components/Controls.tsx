import cn from "clsx";
import { Progress } from "./Progress";
import { SlotProgress } from "./SlotProgress";
import { Settings } from "./Settings";
import { TimeStat } from "./TimeStat";
import { Center } from "./Center";
import { BottomControls } from "./BottomControls";
import { useUiContext } from "./UiContext";

export function Controls() {
  const { state, seekTo, visible, visibleControls, settings, fullscreen } =
    useUiContext();

  return (
    <>
      <div
        ref={visible.elementRef}
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
          {state.slot ? (
            <div className="absolute left-0 right-0 bottom-0 px-4">
              <SlotProgress slot={state.slot} />
            </div>
          ) : (
            <div className="absolute left-0 right-0 bottom-0 flex items-center px-4">
              <Progress onSeeked={seekTo} />
              <TimeStat />
            </div>
          )}
        </div>
        <div className="px-4 mb-2">
          <BottomControls />
        </div>
      </div>
      <Settings />
      <Center onFullscreenClick={fullscreen?.onClick} />
    </>
  );
}
