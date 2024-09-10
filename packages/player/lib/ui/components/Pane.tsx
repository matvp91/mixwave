type PaneProps = {
  title: string;
  children: React.ReactNode;
};

export function Pane({ title, children }: PaneProps) {
  return (
    <div className="p-4">
      <div className="font-medium text-sm mb-2">{title}</div>
      <div className="ml-1">{children}</div>
    </div>
  );
}
