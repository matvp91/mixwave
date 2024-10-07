import { FilterResolutionInvalidError } from "./errors.js";
import type { MasterPlaylist, Variant } from "./parser/index.js";
import type { SessionFilter } from "./session.js";

const FILTER_VARIANTS_OPERATOR = {
  "<": (a: number, b: number) => a < b,
  "<=": (a: number, b: number) => a <= b,
  ">": (a: number, b: number) => a > b,
  ">=": (a: number, b: number) => a >= b,
} as const;

function getResolutionFilter(resolution: string) {
  const [operator, value] = resolution.split(" ");
  const height = parseInt(value, 10);

  const fn = FILTER_VARIANTS_OPERATOR[operator];

  if (Number.isNaN(height) || typeof fn !== "function") {
    throw new FilterResolutionInvalidError(resolution);
  }

  return [height, fn];
}

function filterVariantsByResolution(variants: Variant[], resolution: string) {
  const [height, fn] = getResolutionFilter(resolution);
  return variants.filter(
    (item) => item.resolution && fn(item.resolution.height, height),
  );
}

export function filterMaster(master: MasterPlaylist, filter: SessionFilter) {
  if (filter.resolution) {
    master.variants = filterVariantsByResolution(
      master.variants,
      filter.resolution,
    );
  }
}

export function validateFilter(filter: SessionFilter) {
  if (filter.resolution) {
    getResolutionFilter(filter.resolution);
  }
}
