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
    <div className="relative">
      <div className="absolute w-full flex justify-center bottom-12">
        <div className="p-2 mb-1 bg-black/85 text-white rounded-md border border-white/20">
          <input
            type="range"
            style={style}
            className="appearance-none bg-transparent [&::-webkit-slider-runnable-track]:transparent [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full"
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
