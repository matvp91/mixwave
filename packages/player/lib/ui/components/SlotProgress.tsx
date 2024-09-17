import type { Slot } from "../..";

type SlotProgressProps = {
  slot: Slot;
};

export function SlotProgress({ slot }: SlotProgressProps) {
  if (slot.type === "ad") {
    return (
      <div className="relative grow flex items-center h-6">
        <div className="absolute w-full bg-white/50 h-1" />
        <div
          className="absolute bg-[#ffd32c] h-1"
          style={{
            width: `${100 - (slot.time / slot.duration) * 100}%`,
          }}
        />
      </div>
    );
  }
  return null;
}
