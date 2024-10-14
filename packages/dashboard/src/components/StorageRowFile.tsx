import { TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/api";
import { useState } from "react";
import { Loader } from "./Loader";
import { Button } from "@/components/ui/button";
import SquareArrowOutUpRight from "lucide-react/icons/square-arrow-out-up-right";
import { getSizeStr } from "@/lib/helpers";
import type { StorageFolderItem, StorageFile } from "@/api";

type StorageRowFileProps = {
  name: string;
  item: Extract<StorageFolderItem, { type: "file" }>;
  setFile(file: StorageFile): void;
};

export function StorageRowFile({ name, item, setFile }: StorageRowFileProps) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const response = await api.storage.file.get({
        query: { path: item.path },
      });
      if (response.data) {
        setFile(response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableRow>
      <TableCell></TableCell>
      <TableCell className="flex gap-2 items-center">
        {name}
        {item.canPreview ? (
          <Button
            size="icon"
            disabled={loading}
            variant="secondary"
            onClick={onClick}
            className="w-5 h-5 p-0"
          >
            {loading ? (
              <Loader className="w-4 h-4" />
            ) : (
              <SquareArrowOutUpRight className="w-3 h-3" />
            )}
          </Button>
        ) : null}
      </TableCell>
      <TableCell>{getSizeStr(item.size)}</TableCell>
    </TableRow>
  );
}
