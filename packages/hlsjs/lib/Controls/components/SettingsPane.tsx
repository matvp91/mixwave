import cn from "clsx";

type SettingsPaneProps = {
  children: React.ReactNode;
  active: boolean;
};

export function SettingsPane({ children, active }: SettingsPaneProps) {
  return (
    <div
      className={cn("mix-settings-pane", active && "mix-settings-pane--active")}
    >
      {children}
    </div>
  );
}
