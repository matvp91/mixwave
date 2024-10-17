import { useContext } from "react";
import { ControllerContext } from "../ControllerProvider";

export function useFacade() {
  const { facade } = useContext(ControllerContext);
  return facade;
}
