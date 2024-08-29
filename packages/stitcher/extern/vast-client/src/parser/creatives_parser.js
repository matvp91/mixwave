import { parseCreativeCompanion } from "./creative_companion_parser.js";
import { parseCreativeLinear } from "./creative_linear_parser.js";
import { parseCreativeNonLinear } from "./creative_non_linear_parser.js";
import { parseExtensions } from "./extensions_parser.js";
import { parserUtils } from "./parser_utils.js";

/**
 * Parses the creatives from the Creatives Node.
 * @param  {any} creativeNodes - The creative nodes to parse.
 * @return {Array<Creative>} - An array of Creative objects.
 */
export function parseCreatives(creativeNodes) {
  const creatives = [];

  creativeNodes.forEach((creativeElement) => {
    const creativeAttributes = {
      id: creativeElement.getAttribute("id") || null,
      adId: parseCreativeAdIdAttribute(creativeElement),
      sequence: creativeElement.getAttribute("sequence") || null,
      apiFramework: creativeElement.getAttribute("apiFramework") || null,
    };

    const universalAdIds = [];
    const universalAdIdElements = parserUtils.childrenByName(
      creativeElement,
      "UniversalAdId",
    );
    universalAdIdElements.forEach((universalAdIdElement) => {
      const universalAdId = {
        idRegistry:
          universalAdIdElement.getAttribute("idRegistry") || "unknown",
        value: parserUtils.parseNodeText(universalAdIdElement),
      };
      universalAdIds.push(universalAdId);
    });

    let creativeExtensions;
    const creativeExtensionsElement = parserUtils.childByName(
      creativeElement,
      "CreativeExtensions",
    );
    if (creativeExtensionsElement) {
      creativeExtensions = parseExtensions(
        parserUtils.childrenByName(
          creativeExtensionsElement,
          "CreativeExtension",
        ),
      );
    }

    for (const creativeTypeElementKey in creativeElement.childNodes) {
      const creativeTypeElement =
        creativeElement.childNodes[creativeTypeElementKey];
      let parsedCreative;

      switch (creativeTypeElement.nodeName) {
        case "Linear":
          parsedCreative = parseCreativeLinear(
            creativeTypeElement,
            creativeAttributes,
          );
          break;
        case "NonLinearAds":
          parsedCreative = parseCreativeNonLinear(
            creativeTypeElement,
            creativeAttributes,
          );
          break;
        case "CompanionAds":
          parsedCreative = parseCreativeCompanion(
            creativeTypeElement,
            creativeAttributes,
          );
          break;
      }

      if (parsedCreative) {
        if (universalAdIds) {
          parsedCreative.universalAdIds = universalAdIds;
        }

        if (creativeExtensions) {
          parsedCreative.creativeExtensions = creativeExtensions;
        }
        creatives.push(parsedCreative);
      }
    }
  });
  return creatives;
}

/**
 * Parses the creative adId Attribute.
 * @param  {any} creativeElement - The creative element to retrieve the adId from.
 * @return {String|null}
 */
function parseCreativeAdIdAttribute(creativeElement) {
  return (
    creativeElement.getAttribute("AdID") || // VAST 2 spec
    creativeElement.getAttribute("adID") || // VAST 3 spec
    creativeElement.getAttribute("adId") || // VAST 4 spec
    null
  );
}
