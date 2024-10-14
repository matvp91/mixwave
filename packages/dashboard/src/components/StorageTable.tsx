import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StorageRow } from "./StorageRow";
import type { UIEventHandler } from "react";
import type { StorageFolderItem, StorageFile } from "@/api";

type StorageExplorerProps = {
  items: StorageFolderItem[];
  onNext(): void;
  setFile(file: StorageFile): void;
};

export function StorageTable({ items, onNext, setFile }: StorageExplorerProps) {
  const onScroll: UIEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as HTMLDivElement;
    const totalHeight = target.scrollHeight - target.offsetHeight;
    if (totalHeight - target.scrollTop < 10) {
      onNext();
    }
  };

  return (
    <div className="grow basis-0 overflow-auto" onScroll={onScroll}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-[200px]">Size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            return <StorageRow key={item.path} item={item} setFile={setFile} />;
          })}
        </TableBody>
      </Table>
    </div>
  );
}
