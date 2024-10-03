import type { Variant } from "../parser/index.js";

export function filterVariantsByString(variants: Variant[], str: string) {
  const [operator, value] = str.split(" ");

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
