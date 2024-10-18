import { useFacade } from "../..";
import { CenterIconPop } from "./CenterIconPop";
import { useRef } from "react";
import type { MouseEventHandler } from "react";
import type { CenterIconPopRef } from "./CenterIconPop";

type CenterProps = {
  onDoubleClick?: MouseEventHandler<HTMLElement>;
};

export function Center({ onDoubleClick }: CenterProps) {
  const facade = useFacade();
  const centerIconPopRef = useRef<CenterIconPopRef>(null);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      onClick={() => {
        facade.playOrPause();
        centerIconPopRef.current?.playOrPause();
      }}
      onDoubleClick={onDoubleClick}
    >
      <CenterIconPop ref={centerIconPopRef} />
    </div>
  );
}
