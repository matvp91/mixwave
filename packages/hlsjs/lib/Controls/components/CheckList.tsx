import cn from "clsx";

type CheckListProps = {
  onSelect(id: number): void;
  items: { id: number; label: string; checked: boolean }[];
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
