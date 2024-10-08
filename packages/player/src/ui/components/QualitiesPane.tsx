import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import type { HlsFacade, State } from "../..";
import type { CheckListItem } from "./CheckList";

type QualitiesPaneProps = {
  state: State;
  facade: HlsFacade;
};

export function QualitiesPane({ facade, state }: QualitiesPaneProps) {
  const activeQuality = state.qualities.find((it) => it.active);

  const qualityItems = state.qualities.map<CheckListItem>((it) => ({
    id: it.id,
    label: `${it.level.height}p`,
    checked: !state.autoQuality && activeQuality === it,
  }));

  qualityItems.push({
    id: null,
    label: "Auto",
    checked: state.autoQuality,
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
