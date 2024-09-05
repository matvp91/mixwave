import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import type { HlsFacade, HlsState } from "../../main";

type QualitiesPaneProps = {
  state: HlsState;
  facade: HlsFacade;
};

export function QualitiesPane({ facade, state }: QualitiesPaneProps) {
  return (
    <Pane title="Quality">
      <CheckList
        onSelect={(id) => facade.setQuality(id)}
        items={state.qualities.map((quality) => ({
          id: quality.id,
          label: `${quality.height}p`,
          checked: quality.active,
        }))}
      />
    </Pane>
  );
}
