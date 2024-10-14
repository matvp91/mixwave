import { Link } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import Folder from "lucide-react/icons/folder";
import { StorageRowFile } from "./StorageRowFile";
import type { FolderDto, FileDto } from "@/api";

type StorageRowProps = {
  content: FolderDto;
  setFile(file: FileDto): void;
};

export function StorageRow({ content, setFile }: StorageRowProps) {
  const chunks = content.path.split("/");

  if (content.type === "folder") {
    const name = chunks[chunks.length - 2];
    return (
      <TableRow>
        <TableCell>
          <Folder className="w-4 h-4" />
        </TableCell>
        <TableCell>
          <Link
            to={`/storage?path=${content.path}`}
            className="flex gap-2 text-sm items-center hover:underline w-full"
          >
            {name}
          </Link>
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
    );
  }

  if (content.type === "file") {
    const name = chunks[chunks.length - 1];
    return <StorageRowFile name={name} content={content} setFile={setFile} />;
  }
  return null;
}
