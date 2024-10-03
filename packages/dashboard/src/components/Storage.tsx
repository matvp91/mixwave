import { tsr } from "@/tsr";
import { useState } from "react";
import { Loader } from "@/components/Loader";
import { StorageTable } from "./StorageTable";
import { StorageFilePreview } from "./StorageFilePreview";
import { StoragePathBreadcrumbs } from "./StoragePathBreadcrumbs";
import type { FileDto } from "@/tsr";

type StorageProps = {
  path: string;
};

export function Storage({ path }: StorageProps) {
  const [file, setFile] = useState<FileDto | null>(null);

  const { data, fetchNextPage } = tsr.getStorage.useInfiniteQuery({
    queryKey: ["storage", path],
    queryData: ({ pageParam }) => ({
      query: {
        path,
        cursor: pageParam.cursor,
        take: 30,
      },
    }),
    initialPageParam: { cursor: "" },
    getNextPageParam: (lastPage) => {
      return lastPage.body.cursor
        ? { cursor: lastPage.body.cursor }
        : undefined;
    },
  });

  const contents = data
    ? data.pages.flatMap((page) =>
        page.status === 200 ? page.body.contents : [],
      )
    : null;

  return (
    <div className="flex flex-col grow">
      <div className="p-4 h-14 border-b flex items-center">
        <StoragePathBreadcrumbs path={path} />
      </div>
      {contents ? (
        <StorageTable
          contents={contents}
          onNext={fetchNextPage}
          setFile={setFile}
        />
      ) : (
        <Loader className="min-h-44" />
      )}
      <StorageFilePreview file={file} onClose={() => setFile(null)} />
    </div>
  );
}
