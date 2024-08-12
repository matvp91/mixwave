import * as z from "zod";
import { by639_2T } from "iso-language-codes";

function getZodEnumFromObjectKeys<
  TI extends Record<string, any>,
  R extends string = TI extends Record<infer R, any> ? R : never
>(input: TI): z.ZodEnum<[R, ...R[]]> {
  const [firstKey, ...otherKeys] = Object.keys(input) as [R, ...R[]];
  return z.enum([firstKey, ...otherKeys]);
}

export const zodEnumLanguage = getZodEnumFromObjectKeys(by639_2T);
