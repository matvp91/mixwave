import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import { useFacade, useSelector } from "../..";
import { useI18n } from "../hooks/useI18n";
import type { CheckListItem } from "./CheckList";

export function TextAudioPane() {
  const facade = useFacade();
  const subtitleTracks = useSelector((facade) => facade.subtitleTracks);
  const audioTracks = useSelector((facade) => facade.audioTracks);
  const l = useI18n();

  const subtitleItems = subtitleTracks.map<CheckListItem>((it) => ({
    id: it.id,
    label: it.label,
    checked: it.active,
  }));

  subtitleItems.push({
    id: null,
    label: l("settings.subtitle.none"),
    checked: !subtitleTracks.some((it) => it.active),
  });

  return (
    <div className="flex">
      {subtitleItems.length ? (
        <Pane title={l("settings.subtitle.title")}>
          <CheckList
            onSelect={(id) => facade.setSubtitleTrack(id)}
            items={subtitleItems}
          />
        </Pane>
      ) : null}
      {audioTracks.length ? (
        <Pane title={l("settings.audio.title")}>
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
      ) : null}
    </div>
  );
}
