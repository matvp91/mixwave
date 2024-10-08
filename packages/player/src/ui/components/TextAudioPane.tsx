import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import type { HlsFacade, State } from "../..";
import type { CheckListItem } from "./CheckList";

type QualitiesPaneProps = {
  state: State;
  facade: HlsFacade;
};

export function TextAudioPane({ facade, state }: QualitiesPaneProps) {
  const subtitleItems = state.subtitleTracks.map<CheckListItem>((it) => ({
    id: it.id,
    label: toLang(it.playlist.name),
    checked: it.active,
  }));

  subtitleItems.push({
    id: null,
    label: "None",
    checked: !state.subtitleTracks.some((it) => it.active),
  });

  return (
    <div className="flex">
      <Pane title="Subtitles">
        <CheckList
          onSelect={(id) => facade.setSubtitleTrack(id)}
          items={subtitleItems}
        />
      </Pane>
      <Pane title="Audio">
        <CheckList
          onSelect={(id) => facade.setAudioTrack(id)}
          items={state.audioTracks.map((it) => ({
            id: it.id,
            label: toLang(it.playlist.name),
            checked: it.active,
          }))}
        />
      </Pane>
    </div>
  );
}

function toLang(name: string) {
  const lower = name.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
