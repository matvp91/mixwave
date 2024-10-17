import { useSelector } from "../..";
import { useAppStore } from "../AppStoreProvider";

export function useVisibleControls() {
  const started = useSelector((facade) => facade.started);

  const visible = useAppStore((state) => state.visible);
  const settings = useAppStore((state) => state.settings);
  const seeking = useAppStore((state) => state.seeking);

  if (!started) {
    return false;
  }

  return visible || settings !== null || seeking;
}
