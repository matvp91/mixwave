import { tsr } from "@/tsr";
import { useState } from "react";
import { Loader } from "@/components/Loader";
import { StorageTable } from "./StorageTable";
import { StorageFilePreview } from "./StorageFilePreview";
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

  if (!data) {
    return <Loader className="min-h-44" />;
  }

  const contents = data.pages.flatMap((page) =>
    page.status === 200 ? page.body.contents : [],
  );

  return (
    <>
      <StorageTable
        path={path}
        contents={contents}
        onNext={fetchNextPage}
        setFile={setFile}
      />
      <StorageFilePreview file={file} onClose={() => setFile(null)} />
    </>
  );
}
