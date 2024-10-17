import { useUiContext } from "../context/UiContext";

export function SlotProgress() {
  const { state } = useUiContext();

  if (!state.interstitial) {
    return null;
  }

  if (state.interstitial.type === "ad") {
    return (
      <div className="relative grow flex items-center h-6">
        <div className="absolute w-full bg-white/50 h-1" />
        <div
          className="absolute bg-[#ffd32c] h-1"
          style={{
            width: `${100 - (state.interstitial.time / state.interstitial.duration) * 100}%`,
          }}
        />
      </div>
    );
  }

  return null;
}
