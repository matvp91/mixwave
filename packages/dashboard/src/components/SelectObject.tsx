import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectObjectItem = {
  label: React.ReactNode;
  value?: string;
};

type SelectObjectProps = {
  items: SelectObjectItem[];
  value?: string;
  onChange(value?: string): void;
};

export function SelectObject({ items, value, onChange }: SelectObjectProps) {
  return (
    <Select
      value={toString(value)}
      onValueChange={(value) => onChange(toOrig(value))}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => {
          const value = toString(item.value);
          return (
            <SelectItem key={value} value={value}>
              {item.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function toString(value?: unknown) {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }
  return String(value);
}

function toOrig(value: string) {
  if (value === "undefined") {
    return undefined;
  }
  return value;
}
