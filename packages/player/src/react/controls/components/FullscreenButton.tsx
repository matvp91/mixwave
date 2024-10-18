import FullscreenIcon from "../icons/fullscreen.svg?react";
import FullscreenExitIcon from "../icons/fullscreen-exit.svg?react";
import { SqButton } from "./SqButton";
import { useAppStore } from "../hooks/useAppStore";
import type { MouseEventHandler } from "react";

type FullscreenButtonProps = {
  toggleFullscreen: MouseEventHandler<HTMLElement>;
};

export function FullscreenButton({ toggleFullscreen }: FullscreenButtonProps) {
  const fullscreen = useAppStore((state) => state.fullscreen);

  return (
    <SqButton
      onClick={toggleFullscreen}
      tooltip={fullscreen ? "button.exit-fullscreen" : "button.fullscreen"}
      tooltipPlacement="right"
    >
      {fullscreen ? (
        <FullscreenExitIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      ) : (
        <FullscreenIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      )}
    </SqButton>
  );
}
