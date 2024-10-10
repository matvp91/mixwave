import { useUiContext } from "../context/UiContext";
import type { MouseEventHandler } from "react";

type CenterProps = {
  onFullscreenClick?: MouseEventHandler<HTMLElement>;
};

export function Center({ onFullscreenClick }: CenterProps) {
  const { facade } = useUiContext();

  return (
    <div
      className="absolute inset-0"
      onClick={() => facade.playOrPause()}
      onDoubleClick={onFullscreenClick}
    />
  );
}
