import { Player } from "@/components/Player";
import { PlayerAccordion } from "@/components/PlayerAccordion";
import { useState } from "react";
import { PlayerNpmInstall } from "./PlayerNpmInstall";
import type { Lang, Metadata } from "@mixwave/player/react";

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
    <>
      <div className="mb-2">
        <PlayerNpmInstall />
      </div>
      <Player url={masterUrl} metadata={metadata} lang={lang} />
      <PlayerAccordion
        masterUrl={masterUrl}
        metadata={metadata}
        setMetadata={setMetadata}
        lang={lang}
        setLang={setLang}
      />
    </>
  );
}
