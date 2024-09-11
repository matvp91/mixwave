import type { SlotAsset } from "../..";

type SlotAssetProgressProps = {
  slotAsset: SlotAsset;
};

export function SlotAssetProgress({ slotAsset }: SlotAssetProgressProps) {
  if (slotAsset.type === "ad") {
    return (
      <div className="relative grow flex items-center h-6">
        <div className="absolute w-full bg-white/50 h-1" />
        <div
          className="absolute bg-[#ffd32c] h-1"
          style={{
            width: `${100 - (slotAsset.time / slotAsset.duration) * 100}%`,
          }}
        />
      </div>
    );
  }
  return null;
}
