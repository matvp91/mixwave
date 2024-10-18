import cn from "clsx";
import { useI18n } from "../hooks/useI18n";
import { useSelector } from "../..";
import type { LangKey } from "../i18n";

type SqButtonTooltipProps = {
  value: LangKey;
  placement?: "left" | "right";
};

export function SqButtonTooltip({ value, placement }: SqButtonTooltipProps) {
  const l = useI18n();
  const interstitial = useSelector((facade) => facade.interstitial);

  // We have a progress bar shown when interstitial is an ad, or
  // if we have no interstitial at all.
  let progress = interstitial?.type === "ad" || !interstitial;

  return (
    <div
      className={cn(
        "absolute pointer-events-none h-8 flex items-center transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap",
        placement === "left" && "left-0",
        placement === "right" && "right-0",
        progress ? "-top-[4.625rem]" : "-top-10",
      )}
    >
      <div className="bg-black/50 rounded-md text-xs px-2 py-1">{l(value)}</div>
    </div>
  );
}
