type PaneProps = {
  title: string;
  children: React.ReactNode;
};

export function Pane({ title, children }: PaneProps) {
  return (
    <div className="mix-pane">
      <div className="mix-pane-title">{title}</div>
      <div className="mix-pane-body">{children}</div>
    </div>
  );
}
