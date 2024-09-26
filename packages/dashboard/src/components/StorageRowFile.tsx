import { TableCell, TableRow } from "@/components/ui/table";
import { tsr } from "@/tsr";
import { useState } from "react";
import { Loader } from "./Loader";
import type { FolderDto, PreviewDto } from "@/tsr";

type StorageRowFileProps = {
  name: string;
  content: Extract<FolderDto["contents"][0], { type: "file" }>;
  setPreview(preview: PreviewDto): void;
};

export function StorageRowFile({
  name,
  content,
  setPreview,
}: StorageRowFileProps) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const response = await tsr.getStoragePreview.query({
        query: { path: content.path },
      });
      if (response.status === 200) {
        setPreview(response.body);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPreview =
    name.endsWith(".vtt") || name.endsWith(".m3u8") || name.endsWith(".json");

  return (
    <TableRow>
      <TableCell></TableCell>
      <TableCell>
        {isPreview ? (
          <button
            disabled={loading}
            className="flex items-center disabled:text-muted-foreground"
            onClick={onClick}
          >
            {name}
            {loading ? <Loader className="w-4 h-4 ml-2" /> : null}
          </button>
        ) : (
          name
        )}
      </TableCell>
      <TableCell>{content.size} bytes</TableCell>
    </TableRow>
  );
}
