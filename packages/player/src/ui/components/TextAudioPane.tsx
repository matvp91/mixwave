import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import { useUiContext } from "../context/UiContext";
import type { CheckListItem } from "./CheckList";
import type { SubtitleTrack, AudioTrack } from "@mixwave/player";

export function TextAudioPane() {
  const { facade, state } = useUiContext();

  const subtitleItems = state.subtitleTracks.map<CheckListItem>((it) => ({
    id: it.id,
    label: getSubtitleLabel(it),
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
            label: getAudioLabel(it),
            checked: it.active,
          }))}
        />
      </Pane>
    </div>
  );
}

function getSubtitleLabel(track: SubtitleTrack) {
  return track.lang ?? "unk";
}

function getAudioLabel(track: AudioTrack) {
  let label = track.lang ?? "unk";
  if (track.channels === "6") {
    label += " 5.1";
  }
  return label;
}
