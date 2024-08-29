import { createAd } from "../ad.js";
import { createAdVerification } from "../ad_verification.js";
import { parseCreatives } from "./creatives_parser.js";
import { parseExtensions } from "./extensions_parser.js";
import { parserUtils } from "./parser_utils.js";
import { parserVerification } from "./parser_verification.js";

/**
 * This module provides methods to parse a VAST Ad Element.
 */

/**
 * Parses an Ad element (can either be a Wrapper or an InLine).
 * @param  {Object} adElement - The VAST Ad element to parse.
 * @param  {Function} emit - Emit function used to trigger Warning event
 * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
 * @emits  VASTParser#VAST-warning
 * @return {Object|undefined} - Object containing the ad and if it is wrapper/inline
 */
export function parseAd(
  adElement,
  emit,
  { allowMultipleAds, followAdditionalWrappers } = {},
) {
  const childNodes = Array.from(adElement.childNodes);

  const filteredChildNodes = childNodes.filter((childNode) => {
    const childNodeToLowerCase = childNode.nodeName.toLowerCase();
    return (
      childNodeToLowerCase === "inline" ||
      (followAdditionalWrappers !== false && childNodeToLowerCase === "wrapper")
    );
  });

  for (const node of filteredChildNodes) {
    parserUtils.copyNodeAttribute("id", adElement, node);
    parserUtils.copyNodeAttribute("sequence", adElement, node);
    parserUtils.copyNodeAttribute("adType", adElement, node);

    if (node.nodeName === "Wrapper") {
      return { ad: parseWrapper(node, emit), type: "WRAPPER" };
    } else if (node.nodeName === "InLine") {
      return {
        ad: parseInLine(node, emit, { allowMultipleAds }),
        type: "INLINE",
      };
    }

    const wrongNode = node.nodeName.toLowerCase();
    const message =
      wrongNode === "inline"
        ? `<${node.nodeName}> must be written <InLine>`
        : `<${node.nodeName}> must be written <Wrapper>`;
    emit("VAST-warning", {
      message,
      wrongNode: node,
    });
  }
}

/**
 * Parses an Inline
 * @param  {Object} adElement Element - The VAST Inline element to parse.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
 * @emits  VASTParser#VAST-warning
 * @return {Object} ad - The ad object.
 */
function parseInLine(adElement, emit, { allowMultipleAds } = {}) {
  // if allowMultipleAds is set to false by wrapper attribute
  // only the first stand-alone Ad (with no sequence values) in the
  // requested VAST response is allowed so we won't parse ads with sequence
  if (allowMultipleAds === false && adElement.getAttribute("sequence")) {
    return null;
  }

  return parseAdElement(adElement, emit);
}

/**
 * Parses an ad type (Inline or Wrapper)
 * @param  {Object} adTypeElement - The VAST Inline or Wrapper element to parse.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 * @return {Object} ad - The ad object.
 */
function parseAdElement(adTypeElement, emit) {
  let adVerificationsFromExtensions = [];
  if (emit) {
    parserVerification.verifyRequiredValues(adTypeElement, emit);
  }

  const childNodes = Array.from(adTypeElement.childNodes);
  const ad = createAd(parserUtils.parseAttributes(adTypeElement));

  childNodes.forEach((node) => {
    switch (node.nodeName) {
      case "Error":
        ad.errorURLTemplates.push(parserUtils.parseNodeText(node));
        break;

      case "Impression":
        ad.impressionURLTemplates.push({
          id: node.getAttribute("id") || null,
          url: parserUtils.parseNodeText(node),
        });
        break;

      case "Creatives":
        ad.creatives = parseCreatives(
          parserUtils.childrenByName(node, "Creative"),
        );
        break;

      case "Extensions": {
        const extNodes = parserUtils.childrenByName(node, "Extension");
        ad.extensions = parseExtensions(extNodes);

        /*
          OMID specify adVerifications should be in extensions for VAST < 4.0
          To avoid to put them on two different places in two different format we reparse it
          from extensions the same way than for an AdVerifications node.
        */
        if (!ad.adVerifications.length) {
          adVerificationsFromExtensions =
            _parseAdVerificationsFromExtensions(extNodes);
        }
        break;
      }
      case "AdVerifications":
        ad.adVerifications = _parseAdVerifications(
          parserUtils.childrenByName(node, "Verification"),
        );
        break;

      case "AdSystem":
        ad.system = {
          value: parserUtils.parseNodeText(node),
          version: node.getAttribute("version") || null,
        };
        break;

      case "AdTitle":
        ad.title = parserUtils.parseNodeText(node);
        break;

      case "AdServingId":
        ad.adServingId = parserUtils.parseNodeText(node);
        break;

      case "Category":
        ad.categories.push({
          authority: node.getAttribute("authority") || null,
          value: parserUtils.parseNodeText(node),
        });
        break;

      case "Expires":
        ad.expires = parseInt(parserUtils.parseNodeText(node), 10);
        break;

      case "ViewableImpression":
        ad.viewableImpression.push(_parseViewableImpression(node));
        break;

      case "Description":
        ad.description = parserUtils.parseNodeText(node);
        break;

      case "Advertiser":
        ad.advertiser = {
          id: node.getAttribute("id") || null,
          value: parserUtils.parseNodeText(node),
        };
        break;

      case "Pricing":
        ad.pricing = {
          value: parserUtils.parseNodeText(node),
          model: node.getAttribute("model") || null,
          currency: node.getAttribute("currency") || null,
        };
        break;

      case "Survey":
        ad.survey = {
          value: parserUtils.parseNodeText(node),
          type: node.getAttribute("type") || null,
        };
        break;

      case "BlockedAdCategories":
        ad.blockedAdCategories.push({
          authority: node.getAttribute("authority") || null,
          value: parserUtils.parseNodeText(node),
        });
        break;
    }
  });

  if (adVerificationsFromExtensions.length) {
    ad.adVerifications = ad.adVerifications.concat(
      adVerificationsFromExtensions,
    );
  }
  return ad;
}

/**
 * Parses a Wrapper element without resolving the wrapped urls.
 * @param  {Object} wrapperElement - The VAST Wrapper element to be parsed.
 * @param  {Function} emit - Emit function used to trigger Warning event.
 * @emits  VASTParser#VAST-warning
 * @return {Ad}
 */
function parseWrapper(wrapperElement, emit) {
  const ad = parseAdElement(wrapperElement, emit);

  const followAdditionalWrappersValue = wrapperElement.getAttribute(
    "followAdditionalWrappers",
  );
  const allowMultipleAdsValue = wrapperElement.getAttribute("allowMultipleAds");
  const fallbackOnNoAdValue = wrapperElement.getAttribute("fallbackOnNoAd");
  ad.followAdditionalWrappers = followAdditionalWrappersValue
    ? parserUtils.parseBoolean(followAdditionalWrappersValue)
    : true;

  ad.allowMultipleAds = allowMultipleAdsValue
    ? parserUtils.parseBoolean(allowMultipleAdsValue)
    : false;

  ad.fallbackOnNoAd = fallbackOnNoAdValue
    ? parserUtils.parseBoolean(fallbackOnNoAdValue)
    : null;

  let wrapperURLElement = parserUtils.childByName(
    wrapperElement,
    "VASTAdTagURI",
  );

  if (wrapperURLElement) {
    ad.nextWrapperURL = parserUtils.parseNodeText(wrapperURLElement);
  } else {
    wrapperURLElement = parserUtils.childByName(wrapperElement, "VASTAdTagURL");

    if (wrapperURLElement) {
      ad.nextWrapperURL = parserUtils.parseNodeText(
        parserUtils.childByName(wrapperURLElement, "URL"),
      );
    }
  }

  ad.creatives.forEach((wrapperCreativeElement) => {
    if (["linear", "nonlinear"].includes(wrapperCreativeElement.type)) {
      // TrackingEvents Linear / NonLinear
      if (wrapperCreativeElement.trackingEvents) {
        if (!ad.trackingEvents) {
          ad.trackingEvents = {};
        }
        if (!ad.trackingEvents[wrapperCreativeElement.type]) {
          ad.trackingEvents[wrapperCreativeElement.type] = {};
        }

        for (const eventName in wrapperCreativeElement.trackingEvents) {
          const urls = wrapperCreativeElement.trackingEvents[eventName];
          if (
            !Array.isArray(
              ad.trackingEvents[wrapperCreativeElement.type][eventName],
            )
          ) {
            ad.trackingEvents[wrapperCreativeElement.type][eventName] = [];
          }
          urls.forEach((url) => {
            ad.trackingEvents[wrapperCreativeElement.type][eventName].push(url);
          });
        }
      }
      // ClickTracking
      if (wrapperCreativeElement.videoClickTrackingURLTemplates) {
        if (!Array.isArray(ad.videoClickTrackingURLTemplates)) {
          ad.videoClickTrackingURLTemplates = [];
        } // tmp property to save wrapper tracking URLs until they are merged
        wrapperCreativeElement.videoClickTrackingURLTemplates.forEach(
          (item) => {
            ad.videoClickTrackingURLTemplates.push(item);
          },
        );
      }
      // ClickThrough
      if (wrapperCreativeElement.videoClickThroughURLTemplate) {
        ad.videoClickThroughURLTemplate =
          wrapperCreativeElement.videoClickThroughURLTemplate;
      }
      // CustomClick
      if (wrapperCreativeElement.videoCustomClickURLTemplates) {
        if (!Array.isArray(ad.videoCustomClickURLTemplates)) {
          ad.videoCustomClickURLTemplates = [];
        } // tmp property to save wrapper tracking URLs until they are merged
        wrapperCreativeElement.videoCustomClickURLTemplates.forEach((item) => {
          ad.videoCustomClickURLTemplates.push(item);
        });
      }
    }
  });

  if (ad.nextWrapperURL) {
    return ad;
  }
}

/**
 * Parses the AdVerifications Element.
 * @param  {Array} verifications - The array of verifications to parse.
 * @return {Array<Object>}
 */
export function _parseAdVerifications(verifications) {
  const ver = [];

  verifications.forEach((verificationNode) => {
    const verification = createAdVerification();
    const childNodes = Array.from(verificationNode.childNodes);

    parserUtils.assignAttributes(verificationNode.attributes, verification);

    childNodes.forEach(({ nodeName, textContent, attributes }) => {
      switch (nodeName) {
        case "JavaScriptResource":
        case "ExecutableResource":
          verification.resource = textContent.trim();
          parserUtils.assignAttributes(attributes, verification);
          break;
        case "VerificationParameters":
          verification.parameters = textContent.trim();
          break;
      }
    });

    const trackingEventsElement = parserUtils.childByName(
      verificationNode,
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
            if (!Array.isArray(verification.trackingEvents[eventName])) {
              verification.trackingEvents[eventName] = [];
            }
            verification.trackingEvents[eventName].push(trackingURLTemplate);
          }
        });
    }

    ver.push(verification);
  });

  return ver;
}

/**
 * Parses the AdVerifications Element from extension for versions < 4.0
 * @param  {Array<Node>} extensions - The array of extensions to parse.
 * @return {Array<Object>}
 */
export function _parseAdVerificationsFromExtensions(extensions) {
  let adVerificationsNode = null,
    adVerifications = [];

  // Find the first (and only) AdVerifications node from extensions
  extensions.some((extension) => {
    return (adVerificationsNode = parserUtils.childByName(
      extension,
      "AdVerifications",
    ));
  });

  // Parse it if we get it
  if (adVerificationsNode) {
    adVerifications = _parseAdVerifications(
      parserUtils.childrenByName(adVerificationsNode, "Verification"),
    );
  }
  return adVerifications;
}

/**
 * Parses the ViewableImpression Element.
 * @param  {Object} viewableImpressionNode - The ViewableImpression node element.
 * @return {Object} viewableImpression - The viewableImpression object
 */
export function _parseViewableImpression(viewableImpressionNode) {
  const regroupNodesUrl = (urls, node) => {
    const url = parserUtils.parseNodeText(node);
    url && urls.push(url);
    return urls;
  };
  return {
    id: viewableImpressionNode.getAttribute("id") || null,
    viewable: parserUtils
      .childrenByName(viewableImpressionNode, "Viewable")
      .reduce(regroupNodesUrl, []),
    notViewable: parserUtils
      .childrenByName(viewableImpressionNode, "NotViewable")
      .reduce(regroupNodesUrl, []),
    viewUndetermined: parserUtils
      .childrenByName(viewableImpressionNode, "ViewUndetermined")
      .reduce(regroupNodesUrl, []),
  };
}
