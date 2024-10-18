import { useFacade, useSelector } from "../..";
import { SqButton } from "./SqButton";
import PlayIcon from "../icons/play.svg?react";
import PauseIcon from "../icons/pause.svg?react";

type PlayPauseButtonProps = {
  nudgeVisible(): void;
};

export function PlayPauseButton({ nudgeVisible }: PlayPauseButtonProps) {
  const facade = useFacade();
  const playhead = useSelector((facade) => facade.playhead);

  const canPause = playhead === "play" || playhead === "playing";

  return (
    <SqButton
      onClick={() => {
        facade.playOrPause();
        nudgeVisible();
      }}
      tooltip={canPause ? "pause" : "play"}
      tooltipPlacement="left"
    >
      {canPause ? (
        <PauseIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      ) : (
        <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      )}
    </SqButton>
  );
}
