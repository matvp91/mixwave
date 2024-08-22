import { util } from "../util/util.js";

/**
 * This module provides support methods to the parsing classes.
 */

/**
 * Returns the first element of the given node which nodeName matches the given name.
 * @param  {Node} node - The node to use to find a match.
 * @param  {String} name - The name to look for.
 * @return {Object|undefined}
 */
function childByName(node, name) {
  const childNodes = Array.from(node.childNodes);
  return childNodes.find((childNode) => childNode.nodeName === name);
}

/**
 * Returns all the elements of the given node which nodeName match the given name.
 * @param  {Node} node - The node to use to find the matches.
 * @param  {String} name - The name to look for.
 * @return {Array}
 */
function childrenByName(node, name) {
  const childNodes = Array.from(node.childNodes);
  return childNodes.filter((childNode) => childNode.nodeName === name);
}

/**
 * Converts relative vastAdTagUri.
 * @param  {String} vastAdTagUrl - The url to resolve.
 * @param  {String} originalUrl - The original url.
 * @return {String}
 */
function resolveVastAdTagURI(vastAdTagUrl, originalUrl) {
  if (!originalUrl) {
    return vastAdTagUrl;
  }

  if (vastAdTagUrl.startsWith("//")) {
    const { protocol } = location;
    return `${protocol}${vastAdTagUrl}`;
  }

  if (!vastAdTagUrl.includes("://")) {
    // Resolve relative URLs (mainly for unit testing)
    const baseURL = originalUrl.slice(0, originalUrl.lastIndexOf("/"));
    return `${baseURL}/${vastAdTagUrl}`;
  }

  return vastAdTagUrl;
}

/**
 * Converts a boolean string into a Boolean.
 * @param  {String} booleanString - The boolean string to convert.
 * @return {Boolean}
 */
function parseBoolean(booleanString) {
  return ["true", "TRUE", "True", "1"].includes(booleanString);
}

/**
 * Parses a node text (for legacy support).
 * @param  {Object} node - The node to parse the text from.
 * @return {String}
 */
function parseNodeText(node) {
  return node && (node.textContent || node.text || "").trim();
}

/**
 * Copies an attribute from a node to another.
 * @param  {String} attributeName - The name of the attribute to clone.
 * @param  {Object} nodeSource - The source node to copy the attribute from.
 * @param  {Object} nodeDestination - The destination node to copy the attribute at.
 */
function copyNodeAttribute(attributeName, nodeSource, nodeDestination) {
  const attributeValue = nodeSource.getAttribute(attributeName);
  if (attributeValue) {
    nodeDestination.setAttribute(attributeName, attributeValue);
  }
}

/**
 * Converts element attributes into an object, where object key is attribute name
 * and object value is attribute value
 * @param {Element} element
 * @returns {Object}
 */
function parseAttributes(element) {
  const nodeAttributes = Array.from(element.attributes);

  return nodeAttributes.reduce((acc, nodeAttribute) => {
    acc[nodeAttribute.nodeName] = nodeAttribute.nodeValue;
    return acc;
  }, {});
}

/**
 * Parses a String duration into a Number.
 * @param  {String} durationString - The dureation represented as a string.
 * @return {Number}
 */
export function parseDuration(durationString) {
  if (durationString === null || typeof durationString === "undefined") {
    return -1;
  }
  // Some VAST doesn't have an HH:MM:SS duration format but instead jus the number of seconds
  if (util.isNumeric(durationString)) {
    return parseInt(durationString);
  }

  const durationComponents = durationString.split(":");
  if (durationComponents.length !== 3) {
    return -1;
  }

  const secondsAndMS = durationComponents[2].split(".");
  let seconds = parseInt(secondsAndMS[0]);
  if (secondsAndMS.length === 2) {
    seconds += parseFloat(`0.${secondsAndMS[1]}`);
  }

  const minutes = parseInt(durationComponents[1] * 60);
  const hours = parseInt(durationComponents[0] * 60 * 60);

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    isNaN(seconds) ||
    minutes > 60 * 60 ||
    seconds > 60
  ) {
    return -1;
  }
  return hours + minutes + seconds;
}

/**
 * Splits an Array of ads into an Array of Arrays of ads.
 * Each subarray contains either one ad or multiple ads (an AdPod)
 * @param  {Array} ads - An Array of ads to split
 * @return {Array}
 */
function splitVAST(ads) {
  const splittedVAST = [];
  let lastAdPod = null;

  ads.forEach((ad, i) => {
    if (ad.sequence) {
      ad.sequence = parseInt(ad.sequence, 10);
    }
    // The current Ad may be the next Ad of an AdPod
    if (ad.sequence > 1) {
      const lastAd = ads[i - 1];
      // check if the current Ad is exactly the next one in the AdPod
      if (lastAd && lastAd.sequence === ad.sequence - 1) {
        lastAdPod && lastAdPod.push(ad);
        return;
      }
      // If the ad had a sequence attribute but it was not part of a correctly formed
      // AdPod, let's remove the sequence attribute
      delete ad.sequence;
    }

    lastAdPod = [ad];
    splittedVAST.push(lastAdPod);
  });

  return splittedVAST;
}

/**
 * Parses the attributes and assign them to object
 * @param  {Object} attributes attribute
 * @param  {Object} verificationObject with properties which can be assigned
 */
function assignAttributes(attributes, verificationObject) {
  if (attributes) {
    Array.from(attributes).forEach(({ nodeName, nodeValue }) => {
      if (
        nodeName &&
        nodeValue &&
        verificationObject.hasOwnProperty(nodeName)
      ) {
        let value = nodeValue;
        if (typeof verificationObject[nodeName] === "boolean") {
          value = parseBoolean(value);
        }
        verificationObject[nodeName] = value;
      }
    });
  }
}

/**
 * Merges the data between an unwrapped ad and his wrapper.
 * @param  {Ad} unwrappedAd - The 'unwrapped' Ad.
 * @param  {Ad} wrapper - The wrapper Ad.
 * @return {void}
 */
function mergeWrapperAdData(unwrappedAd, wrapper) {
  unwrappedAd.errorURLTemplates = wrapper.errorURLTemplates.concat(
    unwrappedAd.errorURLTemplates,
  );
  unwrappedAd.impressionURLTemplates = wrapper.impressionURLTemplates.concat(
    unwrappedAd.impressionURLTemplates,
  );
  unwrappedAd.extensions = wrapper.extensions.concat(unwrappedAd.extensions);

  if (wrapper.viewableImpression.length > 0) {
    unwrappedAd.viewableImpression = [
      ...unwrappedAd.viewableImpression,
      ...wrapper.viewableImpression,
    ];
  }

  // values from the child wrapper will be overridden
  unwrappedAd.followAdditionalWrappers = wrapper.followAdditionalWrappers;
  unwrappedAd.allowMultipleAds = wrapper.allowMultipleAds;
  unwrappedAd.fallbackOnNoAd = wrapper.fallbackOnNoAd;

  const wrapperCompanions = (wrapper.creatives || []).filter(
    (creative) => creative && creative.type === "companion",
  );
  const wrapperCompanionClickTracking = wrapperCompanions.reduce(
    (result, creative) => {
      (creative.variations || []).forEach((variation) => {
        (variation.companionClickTrackingURLTemplates || []).forEach(
          (companionClickTrackingURLTemplate) => {
            if (
              !util.containsTemplateObject(
                companionClickTrackingURLTemplate,
                result,
              )
            ) {
              result.push(companionClickTrackingURLTemplate);
            }
          },
        );
      });
      return result;
    },
    [],
  );
  unwrappedAd.creatives = wrapperCompanions.concat(unwrappedAd.creatives);

  const wrapperHasVideoClickTracking =
    wrapper.videoClickTrackingURLTemplates &&
    wrapper.videoClickTrackingURLTemplates.length;

  const wrapperHasVideoCustomClick =
    wrapper.videoCustomClickURLTemplates &&
    wrapper.videoCustomClickURLTemplates.length;

  unwrappedAd.creatives.forEach((creative) => {
    // merge tracking events
    if (wrapper.trackingEvents && wrapper.trackingEvents[creative.type]) {
      for (const eventName in wrapper.trackingEvents[creative.type]) {
        const urls = wrapper.trackingEvents[creative.type][eventName];
        if (!Array.isArray(creative.trackingEvents[eventName])) {
          creative.trackingEvents[eventName] = [];
        }
        creative.trackingEvents[eventName] =
          creative.trackingEvents[eventName].concat(urls);
      }
    }

    if (creative.type === "linear") {
      // merge video click tracking url
      if (wrapperHasVideoClickTracking) {
        creative.videoClickTrackingURLTemplates =
          creative.videoClickTrackingURLTemplates.concat(
            wrapper.videoClickTrackingURLTemplates,
          );
      }

      // merge video custom click url
      if (wrapperHasVideoCustomClick) {
        creative.videoCustomClickURLTemplates =
          creative.videoCustomClickURLTemplates.concat(
            wrapper.videoCustomClickURLTemplates,
          );
      }

      // VAST 2.0 support - Use Wrapper/linear/clickThrough when Inline/Linear/clickThrough is null
      if (
        wrapper.videoClickThroughURLTemplate &&
        (creative.videoClickThroughURLTemplate === null ||
          typeof creative.videoClickThroughURLTemplate === "undefined")
      ) {
        creative.videoClickThroughURLTemplate =
          wrapper.videoClickThroughURLTemplate;
      }
    }

    // pass wrapper companion trackers to all companions
    if (creative.type === "companion" && wrapperCompanionClickTracking.length) {
      (creative.variations || []).forEach((variation) => {
        variation.companionClickTrackingURLTemplates =
          util.joinArrayOfUniqueTemplateObjs(
            variation.companionClickTrackingURLTemplates,
            wrapperCompanionClickTracking,
          );
      });
    }
  });

  if (wrapper.adVerifications) {
    // As specified by VAST specs unwrapped ads should contains wrapper adVerification script
    unwrappedAd.adVerifications = unwrappedAd.adVerifications.concat(
      wrapper.adVerifications,
    );
  }

  if (wrapper.blockedAdCategories) {
    unwrappedAd.blockedAdCategories = unwrappedAd.blockedAdCategories.concat(
      wrapper.blockedAdCategories,
    );
  }

  // Merge Wrapper's creatives containing icon elements
  if (wrapper.creatives?.length) {
    // As specified by VAST specs, wrapper should not contain any mediafiles
    const wrapperCreativesWithIconsNode = wrapper.creatives.filter(
      (creative) => creative.icons?.length && !creative.mediaFiles.length,
    );
    if (wrapperCreativesWithIconsNode.length) {
      unwrappedAd.creatives = unwrappedAd.creatives.concat(
        wrapperCreativesWithIconsNode,
      );
    }
  }
}

export const parserUtils = {
  childByName,
  childrenByName,
  resolveVastAdTagURI,
  parseBoolean,
  parseNodeText,
  copyNodeAttribute,
  parseAttributes,
  parseDuration,
  splitVAST,
  assignAttributes,
  mergeWrapperAdData,
};
