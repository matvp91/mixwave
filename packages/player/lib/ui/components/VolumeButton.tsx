import { SqButton } from "./SqButton";
import Volume0Icon from "../icons/volume-0.svg?react";
import { CSSProperties } from "react";

const style: CSSProperties = {
  writingMode: "vertical-lr",
  direction: "rtl",
  verticalAlign: "middle",
};

export function VolumeButton() {
  return (
    <div className="relative group">
      <div className="absolute w-full flex justify-center bottom-12 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="px-2 py-3 mb-1 bg-black/85 text-white rounded-md border border-white/20">
          <input
            type="range"
            style={style}
            className="cursor-pointer appearance-none w-4 bg-transparent [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/50 [&::-webkit-slider-runnable-track]:w-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:-ml-1 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
      </div>
      <SqButton
        onClick={() => {
          console.log("hi");
        }}
      >
        <Volume0Icon className="w-6 h-6 group-hover:scale-110 transition-transform origin-center" />
      </SqButton>
    </div>
  );
}
