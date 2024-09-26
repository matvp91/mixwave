import { Loader } from "@/components/Loader";
import { StorageExplorer } from "@/components/StorageExplorer";
import { tsr } from "@/tsr";
import { useSearchParams } from "react-router-dom";

export function StoragePage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") ?? "";

  const { data, fetchNextPage } = tsr.getStorage.useInfiniteQuery({
    queryKey: ["storage", path],
    queryData: ({ pageParam }) => ({
      query: {
        path,
        skip: pageParam.skip,
        take: 100,
      },
    }),
    initialPageParam: { skip: "" },
    getNextPageParam: (lastPage) => {
      return lastPage.body.skip ? { skip: lastPage.body.skip } : undefined;
    },
  });

  if (!data) {
    return <Loader className="min-h-44" />;
  }

  const contents = data.pages.flatMap((page) =>
    page.status === 200 ? page.body.contents : [],
  );

  return (
    <StorageExplorer
      path={data.pages[0].body.path}
      contents={contents}
      onNext={fetchNextPage}
    />
  );
}
