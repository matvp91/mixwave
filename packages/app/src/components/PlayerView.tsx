import { Player } from "@/components/Player";
import { PlayerAccordion } from "@/components/PlayerAccordion";
import { useState } from "react";
import { PlayerNpmInstall } from "./PlayerNpmInstall";
import type { Lang, Metadata } from "@superstreamer/player/react";

type PlayerViewProps = {
  masterUrl?: string;
};

export function PlayerView({ masterUrl }: PlayerViewProps) {
  const [metadata, setMetadata] = useState<Metadata>({
    title: "",
    subtitle: "",
  });
  const [lang, setLang] = useState<Lang>("eng");

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 mt-2">
        <PlayerNpmInstall />
      </div>
      <div className="px-4 mt-2">
        <Player url={masterUrl} metadata={metadata} lang={lang} />
      </div>
      <div className="px-4 grow basis-0 overflow-y-auto">
        <PlayerAccordion
          masterUrl={masterUrl}
          metadata={metadata}
          setMetadata={setMetadata}
          lang={lang}
          setLang={setLang}
        />
      </div>
    </div>
  );
}
