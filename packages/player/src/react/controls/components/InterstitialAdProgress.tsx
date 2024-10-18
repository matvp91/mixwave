import { useSelector } from "../..";

export function InterstitialAdProgress() {
  const time = useSelector((facade) => facade.interstitial?.time);
  const duration = useSelector((facade) => facade.interstitial?.duration);

  if (time === undefined || duration === undefined) {
    return null;
  }

  return (
    <div className="relative grow flex items-center h-6">
      <div className="absolute w-full bg-white/50 h-1" />
      <div
        className="absolute bg-[#ffd32c] h-1"
        style={{
          width: `${100 - (time / duration) * 100}%`,
        }}
      />
    </div>
  );
}
