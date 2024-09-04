import { SettingsMode } from "../hooks/useSettings";
import type { HlsFacade, HlsState } from "../../main";

type SettingsProps = {
  facade: HlsFacade;
  state: HlsState;
  mode: SettingsMode | null;
};

export function Settings({ facade, state, mode }: SettingsProps) {
  if (mode === "quality") {
    return (
      <div className="mix-settings">
        Quality
        <div>
          {state.qualities.map((quality) => (
            <div
              key={quality.id}
              onClick={() => {
                facade.setQuality(quality.id);
              }}
            >
              {quality.active ? "•" : ""} {quality.height}p
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "text-audio") {
    return <div className="mix-settings">Text & audio</div>;
  }

  return null;
}
