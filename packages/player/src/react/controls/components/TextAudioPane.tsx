import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import { useUiContext } from "../context/UiContext";
import type { CheckListItem } from "./CheckList";

export function TextAudioPane() {
  const { facade, state } = useUiContext();

  const subtitleItems = state.subtitleTracks.map<CheckListItem>((it) => ({
    id: it.id,
    label: it.label,
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
          onSelect={(id) => {
            if (id !== null) {
              facade.setAudioTrack(id);
            }
          }}
          items={state.audioTracks.map((it) => ({
            id: it.id,
            label: it.label,
            checked: it.active,
          }))}
        />
      </Pane>
    </div>
  );
}
