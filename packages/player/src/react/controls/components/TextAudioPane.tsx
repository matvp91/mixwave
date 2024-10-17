import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import { useFacade, useSelector } from "../..";
import type { CheckListItem } from "./CheckList";

export function TextAudioPane() {
  const facade = useFacade();
  const subtitleTracks = useSelector((facade) => facade.subtitleTracks);
  const audioTracks = useSelector((facade) => facade.audioTracks);

  const subtitleItems = subtitleTracks.map<CheckListItem>((it) => ({
    id: it.id,
    label: it.label,
    checked: it.active,
  }));

  subtitleItems.push({
    id: null,
    label: "None",
    checked: !subtitleTracks.some((it) => it.active),
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
          items={audioTracks.map((it) => ({
            id: it.id,
            label: it.label,
            checked: it.active,
          }))}
        />
      </Pane>
    </div>
  );
}
