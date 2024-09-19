import { SqButton } from "./SqButton";
import cn from "clsx";
import Volume0Icon from "../icons/volume-0.svg?react";
import Volume1Icon from "../icons/volume-1.svg?react";
import Volume2Icon from "../icons/volume-2.svg?react";
import VolumeMutedIcon from "../icons/volume-muted.svg?react";
import { CSSProperties, ReactEventHandler, useRef, useState } from "react";

const rangeStyle: CSSProperties = {
  writingMode: "vertical-lr",
  direction: "rtl",
  verticalAlign: "middle",
};

type VolumeButtonProps = {
  volume: number;
  setVolume(volume: number): void;
};

export function VolumeButton({ volume, setVolume }: VolumeButtonProps) {
  const [visible, setVisible] = useState(false);
  const volumeRef = useRef<number>();

  const onChange: ReactEventHandler<HTMLInputElement> = (event) => {
    setVolume(event.currentTarget.valueAsNumber);
  };

  const onPointerLeave: ReactEventHandler<HTMLDivElement> = () => {
    if (visible) {
      setVisible(false);
    }
  };

  let Icon = VolumeMutedIcon;
  let iconStyle: CSSProperties = {};
  if (volume > 0.8) {
    Icon = Volume2Icon;
  } else if (volume > 0.5) {
    Icon = Volume1Icon;
    iconStyle.left = "-1px";
  } else if (volume > 0.2) {
    Icon = Volume0Icon;
    iconStyle.left = "-2px";
  }

  return (
    <div className="group relative z-10" onPointerLeave={onPointerLeave}>
      <div
        className={cn(
          "absolute w-full flex justify-center bottom-12 opacity-0 transition-opacity z-20 group-hover:opacity-100 pointer-events-none",
          visible && "pointer-events-auto",
        )}
      >
        <div className="px-2 py-3 mb-1 bg-black/85 text-white rounded-md border border-white/20">
          <input
            type="range"
            style={rangeStyle}
            className="cursor-pointer appearance-none w-4 bg-transparent [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/50 [&::-webkit-slider-runnable-track]:w-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:-ml-1 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            min={0}
            max={1}
            onChange={onChange}
            value={volume}
            step={0.1}
          />
        </div>
      </div>
      <SqButton
        onClick={() => {
          if (volume !== 0) {
            volumeRef.current = volume;
            setVolume(0);
          } else {
            setVolume(volumeRef.current ?? 1);
          }
        }}
        onIdle={() => setVisible(true)}
        idleTime={0}
      >
        <Icon
          className="relative w-6 h-6 group-hover:scale-110 transition-transform origin-center"
          style={iconStyle}
        />
      </SqButton>
    </div>
  );
}
