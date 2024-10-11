import type { MasterPlaylist, Variant } from "./parser";
import type { SessionFilter } from "./session";

const FILTER_VARIANTS_OPERATOR = {
  "<": (a: number, b: number) => a < b,
  "<=": (a: number, b: number) => a <= b,
  ">": (a: number, b: number) => a > b,
  ">=": (a: number, b: number) => a >= b,
} as const;

function getResolutionFilter(
  resolution: string,
): [number, (a: number, b: number) => boolean] {
  const [operator, value] = resolution.split(" ");
  const height = parseInt(value, 10);

  const fn =
    FILTER_VARIANTS_OPERATOR[operator as keyof typeof FILTER_VARIANTS_OPERATOR];

  if (Number.isNaN(height) || !fn) {
    throw new Error(`Resolution filter with value "${resolution}" is invalid.`);
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
