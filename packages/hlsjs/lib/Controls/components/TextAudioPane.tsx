import { CheckList } from "./CheckList";
import { Pane } from "./Pane";
import type { HlsFacade, HlsState } from "../../main";

type QualitiesPaneProps = {
  state: HlsState;
  facade: HlsFacade;
};

export function TextAudioPane({ facade, state }: QualitiesPaneProps) {
  return (
    <div className="mix-textaudiopane">
      <Pane title="Subtitles">
        <CheckList
          onSelect={(id) => facade.setSubtitleTrack(id)}
          items={state.subtitleTracks.map((subtitleTrack) => ({
            id: subtitleTrack.id,
            label: toLang(subtitleTrack.name),
            checked: subtitleTrack.active,
          }))}
        />
      </Pane>
      <Pane title="Audio">
        <CheckList
          onSelect={(id) => facade.setAudioTrack(id)}
          items={state.audioTracks.map((audioTrack) => ({
            id: audioTrack.id,
            label: toLang(audioTrack.name),
            checked: audioTrack.active,
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
