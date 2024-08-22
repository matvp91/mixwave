import { parseAd } from "./ad_parser.js";
import { EventEmitter } from "../util/event_emitter.js";
import { parserUtils } from "./parser_utils.js";
import { util } from "../util/util.js";
import { createVASTResponse } from "../vast_response.js";
import { updateEstimatedBitrate, estimatedBitrate } from "./bitrate.js";

const DEFAULT_MAX_WRAPPER_DEPTH = 10;
const DEFAULT_EVENT_DATA = {
  ERRORCODE: 900,
  extensions: [],
};

/**
 * This class provides methods to fetch and parse a VAST document.
 * @export
 * @class VASTParser
 * @extends EventEmitter
 */
export class VASTParser extends EventEmitter {
  /**
   * Creates an instance of VASTParser.
   * @constructor
   */
  constructor({ fetcher } = {}) {
    super();
    this.maxWrapperDepth = null;
    this.remainingAds = [];
    this.fetcher = fetcher || null;
  }

  /**
   * Tracks the error provided in the errorCode parameter and emits a VAST-error event for the given error.
   * @param  {Array} urlTemplates - An Array of url templates to use to make the tracking call.
   * @param  {Object} errorCode - An Object containing the error data.
   * @param  {Object} data - One (or more) Object containing additional data.
   * @emits  VASTParser#VAST-error
   * @return {void}
   */
  trackVastError(urlTemplates, errorCode, ...data) {
    this.emit(
      "VAST-error",
      Object.assign({}, DEFAULT_EVENT_DATA, errorCode, ...data),
    );
    util.track(urlTemplates, errorCode);
  }

  /**
   * Returns an array of errorURLTemplates for the VAST being parsed.
   * @return {Array}
   */
  getErrorURLTemplates() {
    return this.rootErrorURLTemplates.concat(this.errorURLTemplates);
  }

  /**
   * Returns the estimated bitrate calculated from all previous requests
   * @returns The average of all estimated bitrates in kb/s.
   */
  getEstimatedBitrate() {
    return estimatedBitrate;
  }

  /**
   * Inits the parsing properties of the class with the custom values provided as options.
   * @param {Object} options - The options to initialize a parsing sequence
   */
  initParsingStatus(options = {}) {
    this.maxWrapperDepth = options.wrapperLimit || DEFAULT_MAX_WRAPPER_DEPTH;
    this.parsingOptions = { allowMultipleAds: options.allowMultipleAds };
    this.rootURL = "";
    this.resetParsingStatus();
    updateEstimatedBitrate(options.byteLength, options.requestDuration);
  }

  /**
   * Reset the parsing property of the class everytime a VAST is parsed
   */
  resetParsingStatus() {
    this.errorURLTemplates = [];
    this.rootErrorURLTemplates = [];
    this.vastVersion = null;
  }
  /**
   * Resolves the next group of ads. If all is true resolves all the remaining ads.
   * @param  {Boolean} all - If true all the remaining ads are resolved
   * @return {Promise}
   */
  getRemainingAds(all) {
    if (this.remainingAds.length === 0) {
      return Promise.reject(
        new Error("No more ads are available for the given VAST"),
      );
    }

    const ads = all
      ? util.flatten(this.remainingAds)
      : this.remainingAds.shift();
    this.errorURLTemplates = [];

    return this.resolveAds(ads, {
      wrapperDepth: 0,
      url: this.rootURL,
    }).then((resolvedAds) => {
      return this.buildVASTResponse(resolvedAds);
    });
  }

  /**
   * Parses the given xml Object into a VASTResponse.
   * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
   * @param  {Object} vastXml - An object representing a vast xml document.
   * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits  VASTParser#VAST-resolving
   * @emits  VASTParser#VAST-resolved
   * @emits  VASTParser#VAST-warning
   * @return {Promise}
   */
  parseVAST(vastXml, options = {}) {
    this.initParsingStatus(options);

    options.isRootVAST = true;

    return this.parse(vastXml, options).then((ads) => {
      return this.buildVASTResponse(ads);
    });
  }

  /**
   * Builds a VASTResponse which can be returned.
   * @param  {Array} ads - An Array of unwrapped ads
   * @return {Object}
   */
  buildVASTResponse(ads) {
    const response = createVASTResponse({
      ads,
      errorURLTemplates: this.getErrorURLTemplates(),
      version: this.vastVersion,
    });
    this.completeWrapperResolving(response);

    return response;
  }

  /**
   * Parses the given xml Object into an array of ads
   * Returns the array or throws an `Error` if an invalid VAST XML is provided
   * @param  {Object} vastXml - An object representing an xml document.
   * @param  {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits  VASTParser#VAST-warning
   * @emits VASTParser#VAST-ad-parsed
   * @return {Array}
   * @throws {Error} `vastXml` must be a valid VAST XMLDocument
   */
  parseVastXml(
    vastXml,
    {
      isRootVAST = false,
      url = null,
      wrapperDepth = 0,
      allowMultipleAds,
      followAdditionalWrappers,
    },
  ) {
    // check if is a valid VAST document
    if (
      !vastXml ||
      !vastXml.documentElement ||
      vastXml.documentElement.nodeName !== "VAST"
    ) {
      this.emit("VAST-ad-parsed", {
        type: "ERROR",
        url,
        wrapperDepth,
      });
      throw new Error("Invalid VAST XMLDocument");
    }

    const ads = [];
    const childNodes = vastXml.documentElement.childNodes;

    /* Only parse the version of the Root VAST for now because we don't know yet how to
     * handle some cases like multiple wrappers in the same vast
     */
    const vastVersion = vastXml.documentElement.getAttribute("version");
    if (isRootVAST) {
      if (vastVersion) this.vastVersion = vastVersion;
    }
    // Fill the VASTResponse object with ads and errorURLTemplates
    for (const nodeKey in childNodes) {
      const node = childNodes[nodeKey];

      if (node.nodeName === "Error") {
        const errorURLTemplate = parserUtils.parseNodeText(node);

        // Distinguish root VAST url templates from ad specific ones
        isRootVAST
          ? this.rootErrorURLTemplates.push(errorURLTemplate)
          : this.errorURLTemplates.push(errorURLTemplate);
      } else if (node.nodeName === "Ad") {
        // allowMultipleAds was introduced in VAST 3
        // for retrocompatibility set it to true
        if (this.vastVersion && parseFloat(this.vastVersion) < 3) {
          allowMultipleAds = true;
        } else if (allowMultipleAds === false && ads.length > 1) {
          // if wrapper allowMultipleAds is set to false only the first stand-alone Ad
          // (with no sequence values) in the requested VAST response is allowed
          break;
        }

        const result = parseAd(node, this.emit.bind(this), {
          allowMultipleAds,
          followAdditionalWrappers,
        });

        if (result.ad) {
          ads.push(result.ad);

          this.emit("VAST-ad-parsed", {
            type: result.type,
            url,
            wrapperDepth,
            adIndex: ads.length - 1,
            vastVersion,
          });
        } else {
          // VAST version of response not supported.
          this.trackVastError(this.getErrorURLTemplates(), {
            ERRORCODE: 101,
          });
        }
      }
    }

    return ads;
  }

  /**
   * Parses the given xml Object into an array of unwrapped ads.
   * Returns a Promise which resolves with the array or rejects with an error according to the result of the parsing.
   * @param {Object} vastXml - An object representing an xml document.
   * @param {Object} options - An optional Object of parameters to be used in the parsing process.
   * @emits VASTParser#VAST-resolving
   * @emits VASTParser#VAST-resolved
   * @emits VASTParser#VAST-warning
   * @return {Promise}
   */
  parse(
    vastXml,
    {
      url = null,
      resolveAll = true,
      wrapperSequence = null,
      previousUrl = null,
      wrapperDepth = 0,
      isRootVAST = false,
      followAdditionalWrappers,
      allowMultipleAds,
    } = {},
  ) {
    let ads = [];
    // allowMultipleAds was introduced in VAST 3 as wrapper attribute
    // for retrocompatibility set it to true for vast pre-version 3
    if (this.vastVersion && parseFloat(this.vastVersion) < 3 && isRootVAST) {
      allowMultipleAds = true;
    }
    try {
      ads = this.parseVastXml(vastXml, {
        isRootVAST,
        url,
        wrapperDepth,
        allowMultipleAds,
        followAdditionalWrappers,
      });
    } catch (e) {
      return Promise.reject(e);
    }

    /* Keep wrapper sequence value to not break AdPod when wrapper contain only one Ad.
    e.g,for a AdPod containing :
    - Inline with sequence=1
    - Inline with sequence=2
    - Wrapper with sequence=3 wrapping a Inline with sequence=1
    once parsed we will obtain :
    - Inline sequence 1,
    - Inline sequence 2,
    - Inline sequence 3
  */
    if (
      ads.length === 1 &&
      wrapperSequence !== undefined &&
      wrapperSequence !== null
    ) {
      ads[0].sequence = wrapperSequence;
    }

    // Split the VAST in case we don't want to resolve everything at the first time
    if (resolveAll === false) {
      this.remainingAds = parserUtils.splitVAST(ads);
      // Remove the first element from the remaining ads array, since we're going to resolve that element
      ads = this.remainingAds.shift();
    }

    return this.resolveAds(ads, {
      wrapperDepth,
      previousUrl,
      url,
    });
  }

  /**
   * Resolves an Array of ads, recursively calling itself with the remaining ads if a no ad
   * response is returned for the given array.
   * @param {Array} ads - An array of ads to resolve
   * @param {Object} options - An options Object containing resolving parameters
   * @return {Promise}
   */
  resolveAds(ads = [], { wrapperDepth, previousUrl, url }) {
    const resolveWrappersPromises = [];
    previousUrl = url;
    ads.forEach((ad) => {
      const resolveWrappersPromise = this.resolveWrappers(
        ad,
        wrapperDepth,
        previousUrl,
      );

      resolveWrappersPromises.push(resolveWrappersPromise);
    });

    return Promise.all(resolveWrappersPromises).then((unwrappedAds) => {
      const resolvedAds = util.flatten(unwrappedAds);

      if (!resolvedAds.length && this.remainingAds.length > 0) {
        const remainingAdsToResolve = this.remainingAds.shift();

        return this.resolveAds(remainingAdsToResolve, {
          wrapperDepth,
          previousUrl,
          url,
        });
      }

      return resolvedAds;
    });
  }

  /**
   * Resolves the wrappers for the given ad in a recursive way.
   * Returns a Promise which resolves with the unwrapped ad or rejects with an error.
   * @param {Object} adToUnWrap - An ad object to be unwrapped.
   * @param {Number} wrapperDepth - The reached depth in the wrapper resolving chain.
   * @param {String} previousUrl - The previous vast url.
   * @return {Promise}
   */
  resolveWrappers(adToUnWrap, wrapperDepth, previousUrl) {
    // Copy ad from parameters to prevent altering given object outside of function scope
    const ad = { ...adToUnWrap };
    return new Promise((resolve) => {
      // Going one level deeper in the wrapper chain
      wrapperDepth++;
      // We already have a resolved VAST ad, no need to resolve wrapper
      if (!ad.nextWrapperURL) {
        delete ad.nextWrapperURL;
        return resolve(ad);
      }

      if (!this.fetcher) {
        ad.VASTAdTagURI = ad.nextWrapperURL;
        delete ad.nextWrapperURL;
        return resolve(ad);
      }

      if (wrapperDepth >= this.maxWrapperDepth) {
        // Wrapper limit reached, as defined by the video player.
        // Too many Wrapper responses have been received with no InLine response.
        ad.errorCode = 302;
        delete ad.nextWrapperURL;
        return resolve(ad);
      }

      // Get full URL
      ad.nextWrapperURL = parserUtils.resolveVastAdTagURI(
        ad.nextWrapperURL,
        previousUrl,
      );

      // If allowMultipleAds is set inside the parameter 'option' of public method
      // override the vast value by the one provided
      const allowMultipleAds =
        this.parsingOptions.allowMultipleAds ?? ad.allowMultipleAds;
      // sequence doesn't carry over in wrapper element
      const wrapperSequence = ad.sequence;

      this.fetcher
        .fetchVAST({
          url: ad.nextWrapperURL,
          emitter: this.emit.bind(this),
          maxWrapperDepth: this.maxWrapperDepth,
        })
        .then((xml) => {
          return this.parse(xml, {
            url: ad.nextWrapperURL,
            previousUrl,
            wrapperSequence,
            wrapperDepth,
            followAdditionalWrappers: ad.followAdditionalWrappers,
            allowMultipleAds,
          }).then((unwrappedAds) => {
            delete ad.nextWrapperURL;
            if (unwrappedAds.length === 0) {
              // No ads returned by the wrappedResponse, discard current <Ad><Wrapper> creatives
              ad.creatives = [];
              return resolve(ad);
            }

            unwrappedAds.forEach((unwrappedAd) => {
              if (unwrappedAd) {
                parserUtils.mergeWrapperAdData(unwrappedAd, ad);
              }
            });

            resolve(unwrappedAds);
          });
        })
        .catch((err) => {
          // Timeout of VAST URI provided in Wrapper element, or of VAST URI provided in a subsequent Wrapper element.
          // (URI was either unavailable or reached a timeout as defined by the video player.)
          ad.errorCode = 301;
          ad.errorMessage = err.message;
          resolve(ad);
        });
    });
  }

  /**
   * Takes care of handling errors when the wrappers are resolved.
   * @param {Object} vastResponse - A resolved VASTResponse.
   */
  completeWrapperResolving(vastResponse) {
    // We've to wait for all <Ad> elements to be parsed before handling error so we can:
    // - Send computed extensions data
    // - Ping all <Error> URIs defined across VAST files

    // No Ad case - The parser never bump into an <Ad> element
    if (vastResponse.ads.length === 0) {
      this.trackVastError(vastResponse.errorURLTemplates, { ERRORCODE: 303 });
    } else {
      for (let index = vastResponse.ads.length - 1; index >= 0; index--) {
        // - Error encountered while parsing
        // - No Creative case - The parser has dealt with soma <Ad><Wrapper> or/and an <Ad><Inline> elements
        // but no creative was found
        const ad = vastResponse.ads[index];
        if ((ad.errorCode || ad.creatives.length === 0) && !ad.VASTAdTagURI) {
          // If VASTAdTagURI is in the vastResponse, it means we are dealing with a Wrapper when using parseVAST from the VASTParser.
          // In that case, we dont want to modify the vastResponse since the creatives node is not required in a wrapper.
          this.trackVastError(
            ad.errorURLTemplates.concat(vastResponse.errorURLTemplates),
            { ERRORCODE: ad.errorCode || 303 },
            { ERRORMESSAGE: ad.errorMessage || "" },
            { extensions: ad.extensions },
            { system: ad.system },
          );
          vastResponse.ads.splice(index, 1);
        }
      }
    }
  }
}
