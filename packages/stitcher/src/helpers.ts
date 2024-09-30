import type * as hlsParser from "../extern/hls-parser/index.js";

export function filterByString(items: hlsParser.types.Variant[], str: string) {
  const [operator, value] = str.split(" ");

  if (operator === "<") {
    return items.filter(
      (item) =>
        item.resolution && item.resolution?.height < parseInt(value, 10),
    );
  }

  if (operator === "<=") {
    return items.filter(
      (item) =>
        item.resolution && item.resolution?.height <= parseInt(value, 10),
    );
  }

  if (operator === ">") {
    return items.filter(
      (item) =>
        item.resolution && item.resolution?.height > parseInt(value, 10),
    );
  }

  if (operator === ">=") {
    return items.filter(
      (item) =>
        item.resolution && item.resolution?.height >= parseInt(value, 10),
    );
  }

  throw new Error("Invalid filter");
}
