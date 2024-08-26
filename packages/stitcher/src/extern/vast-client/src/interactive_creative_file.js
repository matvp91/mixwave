import { parserUtils } from "./parser/parser_utils.js";

export function createInteractiveCreativeFile(
  interactiveCreativeAttributes = {},
) {
  return {
    type: interactiveCreativeAttributes.type || null,
    apiFramework: interactiveCreativeAttributes.apiFramework || null,
    variableDuration: parserUtils.parseBoolean(
      interactiveCreativeAttributes.variableDuration,
    ),
    fileURL: null,
  };
}
