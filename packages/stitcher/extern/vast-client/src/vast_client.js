import { Storage } from "./util/storage.js";
import { VASTParser } from "./parser/vast_parser.js";
import { Fetcher } from "./fetcher/fetcher.js";

/**
 * This class provides methods to fetch and parse a VAST document using VASTParser.
 * In addition it provides options to skip consecutive calls based on constraints.
 * @export
 * @class VASTClient
 */
export class VASTClient {
  /**
   * Creates an instance of VASTClient.
   * @param  {Number} cappingFreeLunch - The number of first calls to skip.
   * @param  {Number} cappingMinimumTimeInterval - The minimum time interval between two consecutive calls.
   * @param  {Storage} customStorage - A custom storage to use instead of the default one.
   * @constructor
   */
  constructor(
    cappingFreeLunch = 0,
    cappingMinimumTimeInterval = 0,
    customStorage = new Storage(),
  ) {
    this.cappingFreeLunch = cappingFreeLunch;
    this.cappingMinimumTimeInterval = cappingMinimumTimeInterval;
    this.fetcher = new Fetcher();
    this.vastParser = new VASTParser({ fetcher: this.fetcher });
    this.storage = customStorage;
    // Init values if not already set
    if (this.lastSuccessfulAd === undefined) {
      this.lastSuccessfulAd = 0;
    }

    if (this.totalCalls === undefined) {
      this.totalCalls = 0;
    }
    if (this.totalCallsTimeout === undefined) {
      this.totalCallsTimeout = 0;
    }
  }

  /**
   * Adds a filter function to the array of filters which are called before fetching a VAST document.
   * @param  {function} filter - The filter function to be added at the end of the array.
   * @return {void}
   */
  addURLTemplateFilter(filter) {
    this.fetcher.addURLTemplateFilter(filter);
  }

  /**
   * Removes the last element of the url templates filters array.
   * @return {void}
   */
  removeLastURLTemplateFilter() {
    this.fetcher.removeLastURLTemplateFilter();
  }

  /**
   * Returns the number of filters of the url templates filters array.
   * @return {Number}
   */
  countURLTemplateFilters() {
    return this.fetcher.countURLTemplateFilters();
  }

  /**
   * Removes all the filter functions from the url templates filters array.
   * @return {void}
   */
  clearURLTemplateFilters() {
    this.fetcher.clearURLTemplateFilters();
  }

  getParser() {
    return this.vastParser;
  }

  get lastSuccessfulAd() {
    return this.storage.getItem("vast-client-last-successful-ad");
  }

  set lastSuccessfulAd(value) {
    this.storage.setItem("vast-client-last-successful-ad", value);
  }

  get totalCalls() {
    return this.storage.getItem("vast-client-total-calls");
  }

  set totalCalls(value) {
    this.storage.setItem("vast-client-total-calls", value);
  }

  get totalCallsTimeout() {
    return this.storage.getItem("vast-client-total-calls-timeout");
  }

  set totalCallsTimeout(value) {
    this.storage.setItem("vast-client-total-calls-timeout", value);
  }

  /**
   * Returns a boolean indicating if there are more ads to resolve for the current parsing.
   * @return {Boolean}
   */
  hasRemainingAds() {
    return this.vastParser.remainingAds.length > 0;
  }

  /**
   * Resolves the next group of ads. If all is true resolves all the remaining ads.
   * @param  {Boolean} all - If true all the remaining ads are resolved
   * @return {Promise}
   */
  getNextAds(all) {
    return this.vastParser.getRemainingAds(all);
  }

  /**
   * Parses the given xml Object into a VASTResponse.
   * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
   * @param {Object} xml - An object representing a vast xml document.
   * @param {Object} options - An optional Object of parameters to be used in the parsing and fetching process.
   * @returns {Promise}
   */
  parseVAST(xml, options = {}) {
    this.fetcher.setOptions(options);
    return this.vastParser.parseVAST(xml, options);
  }
  /**
   * Gets a parsed VAST document for the given url, applying the skipping rules defined.
   * Returns a Promise which resolves with a fully parsed VASTResponse or rejects with an Error.
   * @param  {String} url - The url to use to fecth the VAST document.
   * @param  {Object} options - An optional Object of parameters to be applied in the process.
   * @return {Promise}
   */
  get(url, options = {}) {
    const now = Date.now();

    // By default the client resolves only the first Ad or AdPod
    if (!options.hasOwnProperty("resolveAll")) {
      options.resolveAll = false;
    }

    // Check totalCallsTimeout (first call + 1 hour), if older than now,
    // reset totalCalls number, by this way the client will be eligible again
    // for freelunch capping
    if (this.totalCallsTimeout < now) {
      this.totalCalls = 1;
      this.totalCallsTimeout = now + 60 * 60 * 1000;
    } else {
      this.totalCalls++;
    }

    return new Promise((resolve, reject) => {
      if (this.cappingFreeLunch >= this.totalCalls) {
        return reject(
          new Error(
            `VAST call canceled – FreeLunch capping not reached yet ${this.totalCalls}/${this.cappingFreeLunch}`,
          ),
        );
      }

      const timeSinceLastCall = now - this.lastSuccessfulAd;

      // Check timeSinceLastCall to be a positive number. If not, this mean the
      // previous was made in the future. We reset lastSuccessfulAd value
      if (timeSinceLastCall < 0) {
        this.lastSuccessfulAd = 0;
      } else if (timeSinceLastCall < this.cappingMinimumTimeInterval) {
        return reject(
          new Error(
            `VAST call canceled – (${this.cappingMinimumTimeInterval})ms minimum interval reached`,
          ),
        );
      }

      this.vastParser.initParsingStatus(options);
      this.fetcher.setOptions(options);
      this.vastParser.rootURL = url;

      this.fetcher
        .fetchVAST({
          url,
          emitter: this.vastParser.emit.bind(this.vastParser),
          maxWrapperDepth: this.vastParser.maxWrapperDepth,
        })
        .then((xml) => {
          options.previousUrl = url;
          options.isRootVAST = true;
          options.url = url;
          return this.vastParser.parse(xml, options).then((resolvedAd) => {
            const vastResponse = this.vastParser.buildVASTResponse(resolvedAd);
            resolve(vastResponse);
          });
        })
        .catch((err) => reject(err));
    });
  }
}
