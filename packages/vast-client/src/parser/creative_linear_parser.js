import { createCreativeLinear } from "../creative/creative_linear.js";
import { createClosedCaptionFile } from "../closed_caption_file.js";
import { createIcon } from "../icon.js";
import { createInteractiveCreativeFile } from "../interactive_creative_file.js";
import { createMediaFile } from "../media_file.js";
import { createMezzanine } from "../mezzanine.js";
import { parserUtils } from "./parser_utils.js";

/**
 * This module provides methods to parse a VAST Linear Element.
 */

/**
 * Parses a Linear element.
 * @param  {Object} creativeElement - The VAST Linear element to parse.
 * @param  {any} creativeAttributes - The attributes of the Linear (optional).
 * @return {Object} creative - The creativeLinear object.
 */
export function parseCreativeLinear(creativeElement, creativeAttributes) {
  let offset;
  const creative = createCreativeLinear(creativeAttributes);

  creative.duration = parserUtils.parseDuration(
    parserUtils.parseNodeText(
      parserUtils.childByName(creativeElement, "Duration"),
    ),
  );
  const skipOffset = creativeElement.getAttribute("skipoffset");

  if (typeof skipOffset === "undefined" || skipOffset === null) {
    creative.skipDelay = null;
  } else if (
    skipOffset.charAt(skipOffset.length - 1) === "%" &&
    creative.duration !== -1
  ) {
    const percent = parseInt(skipOffset, 10);
    creative.skipDelay = creative.duration * (percent / 100);
  } else {
    creative.skipDelay = parserUtils.parseDuration(skipOffset);
  }

  const videoClicksElement = parserUtils.childByName(
    creativeElement,
    "VideoClicks",
  );
  if (videoClicksElement) {
    const videoClickThroughElement = parserUtils.childByName(
      videoClicksElement,
      "ClickThrough",
    );
    if (videoClickThroughElement) {
      creative.videoClickThroughURLTemplate = {
        id: videoClickThroughElement.getAttribute("id") || null,
        url: parserUtils.parseNodeText(videoClickThroughElement),
      };
    } else {
      creative.videoClickThroughURLTemplate = null;
    }

    parserUtils
      .childrenByName(videoClicksElement, "ClickTracking")
      .forEach((clickTrackingElement) => {
        creative.videoClickTrackingURLTemplates.push({
          id: clickTrackingElement.getAttribute("id") || null,
          url: parserUtils.parseNodeText(clickTrackingElement),
        });
      });

    parserUtils
      .childrenByName(videoClicksElement, "CustomClick")
      .forEach((customClickElement) => {
        creative.videoCustomClickURLTemplates.push({
          id: customClickElement.getAttribute("id") || null,
          url: parserUtils.parseNodeText(customClickElement),
        });
      });
  }

  const adParamsElement = parserUtils.childByName(
    creativeElement,
    "AdParameters",
  );
  if (adParamsElement) {
    creative.adParameters = {
      value: parserUtils.parseNodeText(adParamsElement),
      xmlEncoded: adParamsElement.getAttribute("xmlEncoded") || null,
    };
  }

  parserUtils
    .childrenByName(creativeElement, "TrackingEvents")
    .forEach((trackingEventsElement) => {
      parserUtils
        .childrenByName(trackingEventsElement, "Tracking")
        .forEach((trackingElement) => {
          let eventName = trackingElement.getAttribute("event");
          const trackingURLTemplate =
            parserUtils.parseNodeText(trackingElement);
          if (eventName && trackingURLTemplate) {
            if (eventName === "progress") {
              offset = trackingElement.getAttribute("offset");
              if (!offset) {
                return;
              }
              if (offset.charAt(offset.length - 1) === "%") {
                eventName = `progress-${offset}`;
              } else {
                eventName = `progress-${Math.round(
                  parserUtils.parseDuration(offset),
                )}`;
              }
            }

            if (!Array.isArray(creative.trackingEvents[eventName])) {
              creative.trackingEvents[eventName] = [];
            }
            creative.trackingEvents[eventName].push(trackingURLTemplate);
          }
        });
    });

  parserUtils
    .childrenByName(creativeElement, "MediaFiles")
    .forEach((mediaFilesElement) => {
      parserUtils
        .childrenByName(mediaFilesElement, "MediaFile")
        .forEach((mediaFileElement) => {
          creative.mediaFiles.push(parseMediaFile(mediaFileElement));
        });

      const interactiveCreativeElement = parserUtils.childByName(
        mediaFilesElement,
        "InteractiveCreativeFile",
      );
      if (interactiveCreativeElement) {
        creative.interactiveCreativeFile = parseInteractiveCreativeFile(
          interactiveCreativeElement,
        );
      }

      const closedCaptionElements = parserUtils.childByName(
        mediaFilesElement,
        "ClosedCaptionFiles",
      );
      if (closedCaptionElements) {
        parserUtils
          .childrenByName(closedCaptionElements, "ClosedCaptionFile")
          .forEach((closedCaptionElement) => {
            const closedCaptionFile = createClosedCaptionFile(
              parserUtils.parseAttributes(closedCaptionElement),
            );
            closedCaptionFile.fileURL =
              parserUtils.parseNodeText(closedCaptionElement);

            creative.closedCaptionFiles.push(closedCaptionFile);
          });
      }

      const mezzanineElement = parserUtils.childByName(
        mediaFilesElement,
        "Mezzanine",
      );
      const requiredAttributes = getRequiredAttributes(mezzanineElement, [
        "delivery",
        "type",
        "width",
        "height",
      ]);

      if (requiredAttributes) {
        const mezzanine = createMezzanine();

        mezzanine.id = mezzanineElement.getAttribute("id");
        mezzanine.fileURL = parserUtils.parseNodeText(mezzanineElement);
        mezzanine.delivery = requiredAttributes.delivery;
        mezzanine.codec = mezzanineElement.getAttribute("codec");
        mezzanine.type = requiredAttributes.type;
        mezzanine.width = parseInt(requiredAttributes.width, 10);
        mezzanine.height = parseInt(requiredAttributes.height, 10);
        mezzanine.fileSize = parseInt(
          mezzanineElement.getAttribute("fileSize"),
          10,
        );
        mezzanine.mediaType =
          mezzanineElement.getAttribute("mediaType") || "2D";

        creative.mezzanine = mezzanine;
      }
    });

  const iconsElement = parserUtils.childByName(creativeElement, "Icons");
  if (iconsElement) {
    parserUtils.childrenByName(iconsElement, "Icon").forEach((iconElement) => {
      creative.icons.push(parseIcon(iconElement));
    });
  }

  return creative;
}

/**
 * Parses the MediaFile element from VAST.
 * @param  {Object} mediaFileElement - The VAST MediaFile element.
 * @return {Object} - Parsed mediaFile object.
 */
function parseMediaFile(mediaFileElement) {
  const mediaFile = createMediaFile();
  mediaFile.id = mediaFileElement.getAttribute("id");
  mediaFile.fileURL = parserUtils.parseNodeText(mediaFileElement);
  mediaFile.deliveryType = mediaFileElement.getAttribute("delivery");
  mediaFile.codec = mediaFileElement.getAttribute("codec");
  mediaFile.mimeType = mediaFileElement.getAttribute("type");
  mediaFile.mediaType = mediaFileElement.getAttribute("mediaType") || "2D";
  mediaFile.apiFramework = mediaFileElement.getAttribute("apiFramework");
  mediaFile.fileSize = parseInt(mediaFileElement.getAttribute("fileSize") || 0);
  mediaFile.bitrate = parseInt(mediaFileElement.getAttribute("bitrate") || 0);
  mediaFile.minBitrate = parseInt(
    mediaFileElement.getAttribute("minBitrate") || 0,
  );
  mediaFile.maxBitrate = parseInt(
    mediaFileElement.getAttribute("maxBitrate") || 0,
  );
  mediaFile.width = parseInt(mediaFileElement.getAttribute("width") || 0);
  mediaFile.height = parseInt(mediaFileElement.getAttribute("height") || 0);

  const scalable = mediaFileElement.getAttribute("scalable");
  if (scalable && typeof scalable === "string") {
    mediaFile.scalable = parserUtils.parseBoolean(scalable);
  }

  const maintainAspectRatio = mediaFileElement.getAttribute(
    "maintainAspectRatio",
  );
  if (maintainAspectRatio && typeof maintainAspectRatio === "string") {
    mediaFile.maintainAspectRatio =
      parserUtils.parseBoolean(maintainAspectRatio);
  }
  return mediaFile;
}

/**
 * Parses the InteractiveCreativeFile element from VAST MediaFiles node.
 * @param  {Object} interactiveCreativeElement - The VAST InteractiveCreativeFile element.
 * @return {Object} - Parsed interactiveCreativeFile object.
 */
function parseInteractiveCreativeFile(interactiveCreativeElement) {
  const interactiveCreativeFile = createInteractiveCreativeFile(
    parserUtils.parseAttributes(interactiveCreativeElement),
  );
  interactiveCreativeFile.fileURL = parserUtils.parseNodeText(
    interactiveCreativeElement,
  );
  return interactiveCreativeFile;
}

/**
 * Parses the Icon element from VAST.
 * @param  {Object} iconElement - The VAST Icon element.
 * @return {Object} - Parsed icon object.
 */
function parseIcon(iconElement) {
  const icon = createIcon(iconElement);
  icon.program = iconElement.getAttribute("program");
  icon.height = parseInt(iconElement.getAttribute("height") || 0);
  icon.width = parseInt(iconElement.getAttribute("width") || 0);
  icon.xPosition = parseXPosition(iconElement.getAttribute("xPosition"));
  icon.yPosition = parseYPosition(iconElement.getAttribute("yPosition"));
  icon.apiFramework = iconElement.getAttribute("apiFramework");
  icon.pxratio = iconElement.getAttribute("pxratio") || "1";
  icon.offset = parserUtils.parseDuration(iconElement.getAttribute("offset"));
  icon.duration = parserUtils.parseDuration(
    iconElement.getAttribute("duration"),
  );

  parserUtils
    .childrenByName(iconElement, "HTMLResource")
    .forEach((htmlElement) => {
      icon.type = htmlElement.getAttribute("creativeType") || "text/html";
      icon.htmlResource = parserUtils.parseNodeText(htmlElement);
    });

  parserUtils
    .childrenByName(iconElement, "IFrameResource")
    .forEach((iframeElement) => {
      icon.type = iframeElement.getAttribute("creativeType") || 0;
      icon.iframeResource = parserUtils.parseNodeText(iframeElement);
    });

  parserUtils
    .childrenByName(iconElement, "StaticResource")
    .forEach((staticElement) => {
      icon.type = staticElement.getAttribute("creativeType") || 0;
      icon.staticResource = parserUtils.parseNodeText(staticElement);
    });

  const iconClicksElement = parserUtils.childByName(iconElement, "IconClicks");
  if (iconClicksElement) {
    icon.iconClickThroughURLTemplate = parserUtils.parseNodeText(
      parserUtils.childByName(iconClicksElement, "IconClickThrough"),
    );
    parserUtils
      .childrenByName(iconClicksElement, "IconClickTracking")
      .forEach((iconClickTrackingElement) => {
        icon.iconClickTrackingURLTemplates.push({
          id: iconClickTrackingElement.getAttribute("id") || null,
          url: parserUtils.parseNodeText(iconClickTrackingElement),
        });
      });

    const iconClickFallbackImagesElement = parserUtils.childByName(
      iconClicksElement,
      "IconClickFallbackImages",
    );

    if (iconClickFallbackImagesElement) {
      parserUtils
        .childrenByName(
          iconClickFallbackImagesElement,
          "IconClickFallbackImage",
        )
        .forEach((iconClickFallbackImageElement) => {
          icon.iconClickFallbackImages.push({
            url:
              parserUtils.parseNodeText(iconClickFallbackImageElement) || null,
            width: iconClickFallbackImageElement.getAttribute("width") || null,
            height:
              iconClickFallbackImageElement.getAttribute("height") || null,
          });
        });
    }
  }

  icon.iconViewTrackingURLTemplate = parserUtils.parseNodeText(
    parserUtils.childByName(iconElement, "IconViewTracking"),
  );
  return icon;
}

/**
 * Parses an horizontal position into a String ('left' or 'right') or into a Number.
 * @param  {String} xPosition - The x position to parse.
 * @return {String|Number}
 */
function parseXPosition(xPosition) {
  if (["left", "right"].indexOf(xPosition) !== -1) {
    return xPosition;
  }

  return parseInt(xPosition || 0);
}

/**
 * Parses an vertical position into a String ('top' or 'bottom') or into a Number.
 * @param  {String} yPosition - The x position to parse.
 * @return {String|Number}
 */
function parseYPosition(yPosition) {
  if (["top", "bottom"].indexOf(yPosition) !== -1) {
    return yPosition;
  }

  return parseInt(yPosition || 0);
}

/**
 * Getting required attributes from element
 * @param  {Object} element - DOM element
 * @param  {Array} attributes - list of attributes
 * @return {Object|null} null if a least one element not present
 */
function getRequiredAttributes(element, attributes) {
  const values = {};
  let error = false;

  attributes.forEach((name) => {
    if (!element || !element.getAttribute(name)) {
      error = true;
    } else {
      values[name] = element.getAttribute(name);
    }
  });

  return error ? null : values;
}
