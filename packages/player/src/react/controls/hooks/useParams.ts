import { useContext } from "react";
import { ParamsContext } from "../context/ParamsProvider";

export function useParams() {
  return useContext(ParamsContext);
}
