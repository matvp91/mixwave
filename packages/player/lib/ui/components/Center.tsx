import type { MouseEventHandler } from "react";
import type { HlsFacade } from "../..";

type CenterProps = {
  facade: HlsFacade;
  onFullscreenClick?: MouseEventHandler<HTMLElement>;
};

export function Center({ facade, onFullscreenClick }: CenterProps) {
  return (
    <div
      className="absolute inset-0"
      onClick={() => facade.playOrPause()}
      onDoubleClick={onFullscreenClick}
    />
  );
}
