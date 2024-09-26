import { Link } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import Folder from "lucide-react/icons/folder";
import type { FolderDto } from "@/tsr";

type StorageRowProps = {
  content: FolderDto["contents"][0];
};

export function StorageRow({ content }: StorageRowProps) {
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
    return (
      <TableRow>
        <TableCell></TableCell>
        <TableCell>{name}</TableCell>
        <TableCell>{content.size} bytes</TableCell>
      </TableRow>
    );
  }
  return null;
}
