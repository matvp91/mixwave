import cn from "clsx";
import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import { Quality, useFacade, useSelector } from "../..";
import { useI18n } from "../hooks/useI18n";
import type { CheckListItem } from "./CheckList";

export function QualitiesPane() {
  const facade = useFacade();
  const qualities = useSelector((facade) => facade.qualities);
  const autoQuality = useSelector((facade) => facade.autoQuality);
  const l = useI18n();

  const qualityItems = qualities.map<CheckListItem>((it) => ({
    id: it.height,
    label: `${it.height}p`,
    checked: !autoQuality && it.active,
  }));

  qualityItems.push({
    id: null,
    label: getAutoLabel(qualities, autoQuality),
    checked: autoQuality,
  });

  return (
    <Pane title={l("settings.quality.title")}>
      <CheckList
        onSelect={(id) => facade.setQuality(id)}
        items={qualityItems}
      />
    </Pane>
  );
}

function getAutoLabel(qualities: Quality[], autoQuality: boolean) {
  const l = useI18n();
  const height = qualities.find((it) => it.active)?.height ?? 0;

  return (
    <div className="flex items-center min-w-20 overflow-hidden">
      {l("settings.quality.auto")}
      <span
        className={cn(
          "text-[0.7rem] font-medium ml-auto transition-all",
          autoQuality ? "translate-x-0" : "translate-x-1 opacity-0",
        )}
      >{`${height}p`}</span>
    </div>
  );
}
