import base64 from "hi-base64";
import { postSessionBodySchema } from "./contract.js";

export function parseDirectParams(value: string) {
  const raw = base64.decode(value);
  const obj = JSON.parse(raw);
  return postSessionBodySchema.parse(obj);
}
