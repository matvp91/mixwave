import { Loader } from "@/components/Loader";
import { StorageExplorer } from "@/components/StorageExplorer";
import { tsr } from "@/tsr";
import { useSearchParams } from "react-router-dom";

export function StoragePage() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") ?? "";

  const { data } = tsr.getStorage.useQuery({
    queryKey: ["storage", path],
    queryData: {
      query: { path },
    },
  });

  if (!data) {
    return <Loader className="min-h-44" />;
  }

  return (
    <div className="p-4">
      <StorageExplorer folder={data.body} />
    </div>
  );
}
