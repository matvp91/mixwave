import type { Variant } from "../parser/index.js";

export function filterVariants(variants: Variant[], resolution: string) {
  const [operator, value] = resolution.split(" ");

  const height = parseInt(value, 10);

  if (operator === "<") {
    return variants.filter(
      (item) => item.resolution && item.resolution?.height < height,
    );
  }

  if (operator === "<=") {
    return variants.filter(
      (item) => item.resolution && item.resolution?.height <= height,
    );
  }

  if (operator === ">") {
    return variants.filter(
      (item) => item.resolution && item.resolution?.height > height,
    );
  }

  if (operator === ">=") {
    return variants.filter(
      (item) => item.resolution && item.resolution?.height >= height,
    );
  }

  throw new Error("Invalid filter");
}
