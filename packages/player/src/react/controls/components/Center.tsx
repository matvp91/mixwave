import { useFacade } from "../..";
import type { MouseEventHandler } from "react";

type CenterProps = {
  onDoubleClick?: MouseEventHandler<HTMLElement>;
};

export function Center({ onDoubleClick }: CenterProps) {
  const facade = useFacade();

  return (
    <div
      className="absolute inset-0"
      onClick={() => facade.playOrPause()}
      onDoubleClick={onDoubleClick}
    />
  );
}
