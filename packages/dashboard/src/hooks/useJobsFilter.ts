import { JobsFilterData } from "@/components/types";
import { useSearchParams } from "react-router-dom";

export function useJobsFilter() {
  const [searchParams, setSearchParams] = useSearchParams({});

  const updateParams = (newParams: Partial<JobsFilterData>) => {
    setSearchParams(newParams);
  };

  return [
    {
      tag: searchParams.get("tag"),
      name: searchParams.get("name"),
      state: searchParams.get("state"),
    } as JobsFilterData,
    updateParams,
  ] as const;
}
