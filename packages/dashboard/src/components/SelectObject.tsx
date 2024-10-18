import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectObjectItem = {
  label: React.ReactNode;
  value?: string;
};

type SelectObjectProps = {
  items: SelectObjectItem[];
  value?: string;
  onChange(value?: string): void;
  className?: string;
};

export function SelectObject({
  items,
  value,
  onChange,
  className,
}: SelectObjectProps) {
  return (
    <Select
      value={toString(value)}
      onValueChange={(value) => onChange(toOrig(value))}
    >
      <SelectTrigger className={cn("w-[180px]", className)}>
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
