import { useState } from "react";

export function useQueryParams<T>(defaultValue: T) {
  const [params, setParams] = useState<T>(() => {
    return defaultValue;
  });

  const updateParams = (newParams: Partial<T>) => {
    setParams({ ...params, ...newParams });
  };

  return [params, updateParams] as const;
}
