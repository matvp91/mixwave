import { api } from "@/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader } from "@/components/Loader";
import { StorageTable } from "./StorageTable";
import { StorageFilePreview } from "./StorageFilePreview";
import { StoragePathBreadcrumbs } from "./StoragePathBreadcrumbs";
import type { StorageFile } from "@/api";

type StorageProps = {
  path: string;
};

export function Storage({ path }: StorageProps) {
  const [file, setFile] = useState<StorageFile | null>(null);

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ["storage", path],
    queryFn: async ({ queryKey, pageParam }) => {
      const result = await api.storage.folder.get({
        query: {
          path: queryKey[1],
          cursor: pageParam.cursor,
          take: 30,
        },
      });
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    initialPageParam: { cursor: "" },
    getNextPageParam: (lastPage) => {
      return lastPage?.cursor ? { cursor: lastPage.cursor } : undefined;
    },
  });

  const items = data ? data.pages.flatMap((page) => page.items ?? []) : null;

  return (
    <div className="flex flex-col grow">
      <div className="p-4 h-14 border-b flex items-center">
        <StoragePathBreadcrumbs path={path} />
      </div>
      {items ? (
        <StorageTable items={items} onNext={fetchNextPage} setFile={setFile} />
      ) : (
        <Loader className="min-h-44" />
      )}
      <StorageFilePreview file={file} onClose={() => setFile(null)} />
    </div>
  );
}
