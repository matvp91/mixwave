import cn from "clsx";
import PlayIcon from "../icons/play.svg?react";
import { useUiContext } from "../context/UiContext";

export function Start() {
  const { facade, state } = useUiContext();

  return (
    <button
      className={cn(
        "absolute inset-0 bg-black/30 z-50 transition-opacity text-white flex items-center justify-center group",
        state.isStarted && "opacity-0 pointer-events-none",
      )}
      onClick={() => facade.playOrPause()}
    >
      <div className="p-4 bg-black/50 rounded-full group-active:scale-90 transition-transform">
        <PlayIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </div>
    </button>
  );
}
