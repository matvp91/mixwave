import { createCompanionAd } from "../companion_ad.js";
import { createCreativeCompanion } from "../creative/creative_companion.js";
import { parserUtils } from "./parser_utils.js";

/**
 * This module provides methods to parse a VAST CompanionAd Element.
 */

/**
 * Parses a CompanionAd.
 * @param  {Object} creativeElement - The VAST CompanionAd element to parse.
 * @param  {Object} creativeAttributes - The attributes of the CompanionAd (optional).
 * @return {Object} creative - The creative object.
 */
export function parseCreativeCompanion(creativeElement, creativeAttributes) {
  const creative = createCreativeCompanion(creativeAttributes);
  creative.required = creativeElement.getAttribute("required") || null;

  creative.variations = parserUtils
    .childrenByName(creativeElement, "Companion")
    .map((companionResource) => {
      const companionAd = createCompanionAd(
        parserUtils.parseAttributes(companionResource),
      );

      companionAd.htmlResources = parserUtils
        .childrenByName(companionResource, "HTMLResource")
        .reduce((urls, resource) => {
          const url = parserUtils.parseNodeText(resource);
          return url ? urls.concat(url) : urls;
        }, []);

      companionAd.iframeResources = parserUtils
        .childrenByName(companionResource, "IFrameResource")
        .reduce((urls, resource) => {
          const url = parserUtils.parseNodeText(resource);
          return url ? urls.concat(url) : urls;
        }, []);

      companionAd.staticResources = parserUtils
        .childrenByName(companionResource, "StaticResource")
        .reduce((urls, resource) => {
          const url = parserUtils.parseNodeText(resource);
          return url
            ? urls.concat({
                url,
                creativeType: resource.getAttribute("creativeType") || null,
              })
            : urls;
        }, []);

      companionAd.altText =
        parserUtils.parseNodeText(
          parserUtils.childByName(companionResource, "AltText"),
        ) || null;

      const trackingEventsElement = parserUtils.childByName(
        companionResource,
        "TrackingEvents",
      );
      if (trackingEventsElement) {
        parserUtils
          .childrenByName(trackingEventsElement, "Tracking")
          .forEach((trackingElement) => {
            const eventName = trackingElement.getAttribute("event");
            const trackingURLTemplate =
              parserUtils.parseNodeText(trackingElement);
            if (eventName && trackingURLTemplate) {
              if (!Array.isArray(companionAd.trackingEvents[eventName])) {
                companionAd.trackingEvents[eventName] = [];
              }
              companionAd.trackingEvents[eventName].push(trackingURLTemplate);
            }
          });
      }

      companionAd.companionClickTrackingURLTemplates = parserUtils
        .childrenByName(companionResource, "CompanionClickTracking")
        .map((clickTrackingElement) => {
          return {
            id: clickTrackingElement.getAttribute("id") || null,
            url: parserUtils.parseNodeText(clickTrackingElement),
          };
        });

      companionAd.companionClickThroughURLTemplate =
        parserUtils.parseNodeText(
          parserUtils.childByName(companionResource, "CompanionClickThrough"),
        ) || null;

      const adParametersElement = parserUtils.childByName(
        companionResource,
        "AdParameters",
      );
      if (adParametersElement) {
        companionAd.adParameters = {
          value: parserUtils.parseNodeText(adParametersElement),
          xmlEncoded: adParametersElement.getAttribute("xmlEncoded") || null,
        };
      }

      return companionAd;
    });

  return creative;
}
