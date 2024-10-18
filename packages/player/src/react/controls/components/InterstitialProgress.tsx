import { InterstitialAdProgress } from "./InterstitialAdProgress";
import type { Interstitial } from "../..";

type InterstitialProgressProps = {
  interstitial: Interstitial;
};
export function InterstitialProgress({
  interstitial,
}: InterstitialProgressProps) {
  if (interstitial.type === "ad") {
    return <InterstitialAdProgress />;
  }

  return null;
}
