import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StorageRow } from "./StorageRow";
import type { UIEventHandler } from "react";
import type { FileDto, FolderDto } from "@/api";

type StorageExplorerProps = {
  contents: FolderDto[];
  onNext(): void;
  setFile(file: FileDto): void;
};

export function StorageTable({
  contents,
  onNext,
  setFile,
}: StorageExplorerProps) {
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
          {contents.map((content) => {
            return (
              <StorageRow
                key={content.path}
                content={content}
                setFile={setFile}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
