import type { Variant } from "../parser/index.js";

const FILTER_VARIANTS_OPERATOR = {
  "<": (a: number, b: number) => a < b,
  "<=": (a: number, b: number) => a <= b,
  ">": (a: number, b: number) => a > b,
  ">=": (a: number, b: number) => a >= b,
} as const;

export function filterVariants(variants: Variant[], resolution: string) {
  const [operator, value] = resolution.split(" ");

  const height = parseInt(value, 10);

  const fn = FILTER_VARIANTS_OPERATOR[operator];
  if (typeof fn !== "function") {
    throw new Error(`Invalid filter: ${operator} ${value}`);
  }

  return variants.filter(
    (item) => item.resolution && fn(item.resolution.height, height),
  );
}
