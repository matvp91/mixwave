import cn from "clsx";

export type CheckListItem = {
  id: number | null;
  label: React.ReactNode;
  checked: boolean;
};

type CheckListProps = {
  onSelect(id: CheckListItem["id"]): void;
  items: CheckListItem[];
};

export function CheckList({ items, onSelect }: CheckListProps) {
  return (
    <ul className="mix-checklist">
      {items.map((item) => (
        <li
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={cn(
            "mix-checklist-item",
            item.checked && "mix-checklist-item--active",
          )}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
