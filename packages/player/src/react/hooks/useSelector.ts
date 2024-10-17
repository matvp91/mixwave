import { useContext, useCallback } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";
import { ControllerContext } from "../ControllerProvider";
import type { Facade } from "..";

export function useSelector<Sel>(selector: (snapshot: Facade) => Sel) {
  const controller = useContext(ControllerContext);

  type Snapshot = ReturnType<typeof controller.getSnapshot>;
  const unwrapSelector = useCallback(
    ([facade]: Snapshot) => selector(facade),
    [],
  );

  return useSyncExternalStoreWithSelector(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
    unwrapSelector,
    isEqual,
  );
}

function isEqual<T>(objA: T, objB: T) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;

    for (const [key, value] of objA) {
      if (!Object.is(value, objB.get(key))) {
        return false;
      }
    }
    return true;
  }

  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;

    for (const value of objA) {
      if (!objB.has(value)) {
        return false;
      }
    }
    return true;
  }

  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i] as string) ||
      !Object.is(objA[keysA[i] as keyof T], objB[keysA[i] as keyof T])
    ) {
      return false;
    }
  }
  return true;
}
