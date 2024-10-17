import { createContext } from "react";
import { Controller } from "./hooks/useController";
import type { ReactNode } from "react";

export const ControllerContext = createContext({} as Controller);

type ControllerProviderProps = {
  children: ReactNode;
  controller: Controller;
};

export function ControllerProvider({
  children,
  controller,
}: ControllerProviderProps) {
  return (
    <ControllerContext.Provider value={controller}>
      {children}
    </ControllerContext.Provider>
  );
}
