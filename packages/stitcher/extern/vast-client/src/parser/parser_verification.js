import { requiredValues } from "../util/requiredValues.js";
import { parserUtils } from "./parser_utils.js";

/**
 * Verify node required values and also verify recursively all his child nodes.
 * Trigger warnings if a node required value is missing.
 * @param  {Node} node - The node element.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 * @param  {undefined|Boolean} [isAdInline] - Passed recursively to itself. True if the node is contained inside a inLine tag.
 */
function verifyRequiredValues(node, emit, isAdInline) {
  if (!node || !node.nodeName) {
    return;
  }
  if (node.nodeName === "InLine") {
    isAdInline = true;
  }
  verifyRequiredAttributes(node, emit);

  if (hasSubElements(node)) {
    verifyRequiredSubElements(node, emit, isAdInline);
    for (let i = 0; i < node.children.length; i++) {
      verifyRequiredValues(node.children[i], emit, isAdInline);
    }
  } else if (parserUtils.parseNodeText(node).length === 0) {
    emitMissingValueWarning(
      { name: node.nodeName, parentName: node.parentNode.nodeName },
      emit,
    );
  }
}

/**
 * Verify and trigger warnings if node required attributes are not set.
 * @param  {Node} node - The node element.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 */
function verifyRequiredAttributes(node, emit) {
  if (
    !requiredValues[node.nodeName] ||
    !requiredValues[node.nodeName].attributes
  ) {
    return;
  }
  const requiredAttributes = requiredValues[node.nodeName].attributes;
  const missingAttributes = requiredAttributes.filter(
    (attributeName) => !node.getAttribute(attributeName),
  );
  if (missingAttributes.length > 0) {
    emitMissingValueWarning(
      {
        name: node.nodeName,
        parentName: node.parentNode.nodeName,
        attributes: missingAttributes,
      },
      emit,
    );
  }
}

/**
 * Verify and trigger warnings if node required sub element are not set.
 * @param  {Node} node - The node element
 * @param  {Boolean} isAdInline - True if node is contained in a inline
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 */
function verifyRequiredSubElements(node, emit, isAdInline) {
  const required = requiredValues[node.nodeName];
  // Do not verify subelement if node is a child of wrapper, but verify it if node is the Wrapper itself
  // Wrapper child have no required subElement. (Only InLine does)
  const isInWrapperButNotWrapperItself =
    !isAdInline && node.nodeName !== "Wrapper";
  if (!required || isInWrapperButNotWrapperItself) {
    return;
  }

  if (required.subElements) {
    const requiredSubElements = required.subElements;
    const missingSubElements = requiredSubElements.filter(
      (subElementName) => !parserUtils.childByName(node, subElementName),
    );

    if (missingSubElements.length > 0) {
      emitMissingValueWarning(
        {
          name: node.nodeName,
          parentName: node.parentNode.nodeName,
          subElements: missingSubElements,
        },
        emit,
      );
    }
  }

  // When InLine format is used some nodes (i.e <NonLinear>, <Companion>, or <Icon>)
  // require at least one of the following resources: StaticResource, IFrameResource, HTMLResource
  if (!isAdInline || !required.oneOfinLineResources) {
    return;
  }

  const resourceFound = required.oneOfinLineResources.some((resource) => {
    return parserUtils.childByName(node, resource);
  });
  if (!resourceFound) {
    emitMissingValueWarning(
      {
        name: node.nodeName,
        parentName: node.parentNode.nodeName,
        oneOfResources: required.oneOfinLineResources,
      },
      emit,
    );
  }
}

/**
 * Check if a node has sub elements.
 * @param  {Node} node - The node element.
 * @returns {Boolean}
 */
function hasSubElements(node) {
  return node.children && node.children.length !== 0;
}

/**
 * Trigger Warning if a element is empty or has missing attributes/subelements/resources
 * @param  {Object} missingElement - Object containing missing elements and values
 * @param  {String} missingElement.name - The name of element containing missing values
 * @param  {String} missingElement.parentName - The parent name of element containing missing values
 * @param  {Array} missingElement.attributes - The array of missing attributes
 * @param  {Array} missingElement.subElements - The array of missing sub elements
 * @param  {Array} missingElement.oneOfResources - The array of resources in which at least one must be provided by the element
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VastParser#VAST-warning
 */
function emitMissingValueWarning(
  { name, parentName, attributes, subElements, oneOfResources },
  emit,
) {
  let message = `Element '${name}'`;
  if (attributes) {
    message += ` missing required attribute(s) '${attributes.join(", ")}' `;
  } else if (subElements) {
    message += ` missing required sub element(s) '${subElements.join(", ")}' `;
  } else if (oneOfResources) {
    message += ` must provide one of the following '${oneOfResources.join(
      ", ",
    )}' `;
  } else {
    message += ` is empty`;
  }

  emit("VAST-warning", {
    message,
    parentElement: parentName,
    specVersion: 4.1,
  });
}

export const parserVerification = {
  verifyRequiredValues,
  hasSubElements,
  emitMissingValueWarning,
  verifyRequiredAttributes,
  verifyRequiredSubElements,
};
