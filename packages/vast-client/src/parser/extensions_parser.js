import { createExtension, isEmptyExtension } from "../extension.js";
import { parserUtils } from "./parser_utils.js";

/**
 * Parses an array of Extension elements.
 * @param  {Node[]} extensions - The array of extensions to parse.
 * @param  {String} type - The type of extensions to parse.(Ad|Creative)
 * @return {AdExtension[]|CreativeExtension[]} - The nodes parsed to extensions
 */
export function parseExtensions(extensions) {
  const exts = [];
  extensions.forEach((extNode) => {
    const ext = _parseExtension(extNode);

    if (ext) {
      exts.push(ext);
    }
  });
  return exts;
}

/**
 * Parses an extension child node
 * @param {Node} extNode - The extension node to parse
 * @return {AdExtension|CreativeExtension|null} - The node parsed to extension
 */
function _parseExtension(extNode) {
  // Ignore comments
  if (extNode.nodeName === "#comment") return null;

  const ext = createExtension();

  const extNodeAttrs = extNode.attributes;
  const childNodes = extNode.childNodes;

  ext.name = extNode.nodeName;

  // Parse attributes
  if (extNode.attributes) {
    for (const extNodeAttrKey in extNodeAttrs) {
      if (extNodeAttrs.hasOwnProperty(extNodeAttrKey)) {
        const extNodeAttr = extNodeAttrs[extNodeAttrKey];

        if (extNodeAttr.nodeName && extNodeAttr.nodeValue) {
          ext.attributes[extNodeAttr.nodeName] = extNodeAttr.nodeValue;
        }
      }
    }
  }

  // Parse all children
  for (const childNodeKey in childNodes) {
    if (childNodes.hasOwnProperty(childNodeKey)) {
      const parsedChild = _parseExtension(childNodes[childNodeKey]);
      if (parsedChild) {
        ext.children.push(parsedChild);
      }
    }
  }

  /*
    Only parse value of Nodes with only eather no children or only a cdata or text
    to avoid useless parsing that would result to a concatenation of all children
  */
  if (
    ext.children.length === 0 ||
    (ext.children.length === 1 &&
      ["#cdata-section", "#text"].indexOf(ext.children[0].name) >= 0)
  ) {
    const txt = parserUtils.parseNodeText(extNode);

    if (txt !== "") {
      ext.value = txt;
    }

    // Remove the children if it's a cdata or simply text to avoid useless children
    ext.children = [];
  }

  // Only return not empty objects to not pollute extentions
  return isEmptyExtension(ext) ? null : ext;
}
