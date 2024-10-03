import type { Variant } from "./parser/index.js";

export function filterVariantsByString(variants: Variant[], str: string) {
  const [operator, value] = str.split(" ");

  if (operator === "<") {
    return variants.filter(
      (item) =>
        item.resolution && item.resolution?.height < parseInt(value, 10),
    );
  }

  if (operator === "<=") {
    return variants.filter(
      (item) =>
        item.resolution && item.resolution?.height <= parseInt(value, 10),
    );
  }

  if (operator === ">") {
    return variants.filter(
      (item) =>
        item.resolution && item.resolution?.height > parseInt(value, 10),
    );
  }

  if (operator === ">=") {
    return variants.filter(
      (item) =>
        item.resolution && item.resolution?.height >= parseInt(value, 10),
    );
  }

  throw new Error("Invalid filter");
}
