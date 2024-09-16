import { JobsFilterData } from "@/components/types";
import { useSearchParams } from "react-router-dom";

export function useJobsFilter() {
  const [searchParams, setSearchParams] = useSearchParams({});

  const updateParams = (newParams: Partial<JobsFilterData>) => {
    // JSON parse & stringify will remove all undefined fields.
    setSearchParams(
      JSON.parse(
        JSON.stringify({
          ...Object.fromEntries(searchParams),
          ...newParams,
        }),
      ),
    );
  };

  return [
    {
      tag: searchParams.get("tag") ?? undefined,
      name: searchParams.get("name") ?? undefined,
      state: searchParams.get("state") ?? undefined,
    } as JobsFilterData,
    updateParams,
  ] as const;
}
