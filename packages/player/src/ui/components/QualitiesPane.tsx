import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import { useUiContext } from "../context/UiContext";
import type { CheckListItem } from "./CheckList";
import type { State } from "../..";

export function QualitiesPane() {
  const { facade, state } = useUiContext();

  const qualityItems = state.qualities.map<CheckListItem>((it) => ({
    id: it.height,
    label: `${it.height}p`,
    checked: !state.autoQuality && it.active,
  }));

  qualityItems.push({
    id: null,
    label: getAutoLabel(state),
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

function getAutoLabel(state: State) {
  let text = "Auto";
  const height = state.qualities.find((quality) => quality.active)?.height;

  let label = null;
  if (state.autoQuality && height) {
    label = (
      <span className="text-[0.7rem] font-medium ml-auto">{`${height}p`}</span>
    );
  }

  return (
    <div className="flex items-center min-w-20">
      {text}
      {label}
    </div>
  );
}
