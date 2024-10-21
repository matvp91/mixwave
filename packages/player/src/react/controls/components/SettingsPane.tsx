import cn from "clsx";

type SettingsPaneProps = {
  children: React.ReactNode;
  active: boolean;
};

export function SettingsPane({ children, active }: SettingsPaneProps) {
  return (
    <div
      className={cn(
        "pointer-events-none opacity-0 left-0 top-0",
        active && "pointer-events-auto opacity-100",
      )}
      data-sprs-settings-pane={active ? "active" : ""}
    >
      {children}
    </div>
  );
}
