import cn from "clsx";
import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import { Quality, useFacade, useSelector } from "../..";
import type { CheckListItem } from "./CheckList";

export function QualitiesPane() {
  const facade = useFacade();
  const qualities = useSelector((facade) => facade.qualities);
  const autoQuality = useSelector((facade) => facade.autoQuality);

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
    <Pane title="Quality">
      <CheckList
        onSelect={(id) => facade.setQuality(id)}
        items={qualityItems}
      />
    </Pane>
  );
}

function getAutoLabel(qualities: Quality[], autoQuality: boolean) {
  const height = qualities.find((it) => it.active)?.height ?? 0;

  return (
    <div className="flex items-center min-w-20 overflow-hidden">
      Auto
      <span
        className={cn(
          "text-[0.7rem] font-medium ml-auto transition-all",
          autoQuality ? "translate-x-0" : "translate-x-1 opacity-0",
        )}
      >{`${height}p`}</span>
    </div>
  );
}
