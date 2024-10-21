import { useSelector } from "../..";

export function useShowTextAudio() {
  const hasAudioTracks = useSelector((facade) => facade.audioTracks.length > 0);
  const hasSubtitleTracks = useSelector(
    (facade) => facade.subtitleTracks.length > 0,
  );
  return hasAudioTracks || hasSubtitleTracks;
}
