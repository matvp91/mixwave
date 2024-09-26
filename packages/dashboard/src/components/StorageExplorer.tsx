import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StoragePathBreadcrumbs } from "./StoragePathBreadcrumbs";
import { StorageRow } from "./StorageRow";
import type { FolderDto } from "@/tsr";
import type { UIEventHandler } from "react";

type StorageExplorerProps = {
  path: string;
  contents: FolderDto["contents"];
  onNext(): void;
};

export function StorageExplorer({
  path,
  contents,
  onNext,
}: StorageExplorerProps) {
  const onScroll: UIEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as HTMLDivElement;
    const totalHeight = target.scrollHeight - target.offsetHeight;
    if (totalHeight - target.scrollTop < 10) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col grow">
      <div className="p-4 h-14 border-b">
        <StoragePathBreadcrumbs path={path} />
      </div>
      <div className="grow basis-0 overflow-auto" onScroll={onScroll}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contents.map((content) => {
              return <StorageRow key={content.path} content={content} />;
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
