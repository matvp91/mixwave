import { useContext } from "react";
import { ControllerContext } from "../ControllerProvider";

export function useFacade() {
  const controller = useContext(ControllerContext);
  return controller.facade;
}
