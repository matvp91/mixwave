import { langMap } from "./lang-map";

export function updateActive<T extends { active: boolean }>(
  items: T[],
  getActive: (item: T) => boolean,
) {
  const current = items.findIndex((item) => item.active);
  const active = items.findIndex((item) => getActive(item));

  if (current === active) {
    return items;
  }

  const nextItems: T[] = [];

  for (const item of items) {
    const nextActive = getActive(item);
    if (item.active === nextActive) {
      nextItems.push(item);
      continue;
    }
    nextItems.push({ ...item, active: nextActive });
  }

  return nextItems;
}

export function preciseFloat(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getLang(key?: string) {
  const value = key ? langMap[key]?.split(",")[0] : null;
  return value ?? "Unknown";
}
