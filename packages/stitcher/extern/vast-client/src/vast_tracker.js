import { isCompanionAd } from "./companion_ad.js";
import { isCreativeLinear } from "./creative/creative_linear.js";
import { EventEmitter } from "./util/event_emitter.js";
import { isNonLinearAd } from "./non_linear_ad.js";
import { util } from "./util/util.js";

/**
 * The default skip delay used in case a custom one is not provided
 * @constant
 * @type {Number}
 */
const DEFAULT_SKIP_DELAY = -1;

/**
 * This class provides methods to track an ad execution.
 *
 * @export
 * @class VASTTracker
 * @extends EventEmitter
 */
export class VASTTracker extends EventEmitter {
  /**
   * Creates an instance of VASTTracker.
   *
   * @param {VASTClient} client - An instance of VASTClient that can be updated by the tracker. [optional]
   * @param {Ad} ad - The ad to track.
   * @param {Creative} creative - The creative to track.
   * @param {Object} [variation=null] - An optional variation of the creative.
   * @param {Boolean} [muted=false] - The initial muted state of the video.
   * @constructor
   */
  constructor(client, ad, creative, variation = null, muted = false) {
    super();
    this.ad = ad;
    this.creative = creative;
    this.variation = variation;
    this.muted = muted;
    this.impressed = false;
    this.skippable = false;
    this.trackingEvents = {};
    // We need to keep the last percentage of the tracker in order to
    // calculate to trigger the events when the VAST duration is short
    this.lastPercentage = 0;
    this._alreadyTriggeredQuartiles = {};
    // Tracker listeners should be notified with some events
    // no matter if there is a tracking URL or not
    this.emitAlwaysEvents = [
      "creativeView",
      "start",
      "firstQuartile",
      "midpoint",
      "thirdQuartile",
      "complete",
      "resume",
      "pause",
      "rewind",
      "skip",
      "closeLinear",
      "close",
    ];

    // Duplicate the creative's trackingEvents property so we can alter it
    for (const eventName in this.creative.trackingEvents) {
      const events = this.creative.trackingEvents[eventName];
      this.trackingEvents[eventName] = events.slice(0);
    }

    // Nonlinear and companion creatives provide some tracking information at a variation level
    // While linear creatives provided that at a creative level. That's why we need to
    // differentiate how we retrieve some tracking information.
    if (isCreativeLinear(this.creative)) {
      this._initLinearTracking();
    } else {
      this._initVariationTracking();
    }

    // If the tracker is associated with a client we add a listener to the start event
    // to update the lastSuccessfulAd property.
    if (client) {
      this.on("start", () => {
        client.lastSuccessfulAd = Date.now();
      });
    }
  }

  /**
   * Init the custom tracking options for linear creatives.
   *
   * @return {void}
   */
  _initLinearTracking() {
    this.linear = true;
    this.skipDelay = this.creative.skipDelay;

    this.setDuration(this.creative.duration);

    this.clickThroughURLTemplate = this.creative.videoClickThroughURLTemplate;
    this.clickTrackingURLTemplates =
      this.creative.videoClickTrackingURLTemplates;
  }

  /**
   * Init the custom tracking options for nonlinear and companion creatives.
   * These options are provided in the variation Object.
   *
   * @return {void}
   */
  _initVariationTracking() {
    this.linear = false;
    this.skipDelay = DEFAULT_SKIP_DELAY;

    // If no variation has been provided there's nothing else to set
    if (!this.variation) {
      return;
    }

    // Duplicate the variation's trackingEvents property so we can alter it
    for (const eventName in this.variation.trackingEvents) {
      const events = this.variation.trackingEvents[eventName];

      // If for the given eventName we already had some trackingEvents provided by the creative
      // we want to keep both the creative trackingEvents and the variation ones
      if (this.trackingEvents[eventName]) {
        this.trackingEvents[eventName] = this.trackingEvents[eventName].concat(
          events.slice(0),
        );
      } else {
        this.trackingEvents[eventName] = events.slice(0);
      }
    }

    if (isNonLinearAd(this.variation)) {
      this.clickThroughURLTemplate =
        this.variation.nonlinearClickThroughURLTemplate;
      this.clickTrackingURLTemplates =
        this.variation.nonlinearClickTrackingURLTemplates;
      this.setDuration(this.variation.minSuggestedDuration);
    } else if (isCompanionAd(this.variation)) {
      this.clickThroughURLTemplate =
        this.variation.companionClickThroughURLTemplate;
      this.clickTrackingURLTemplates =
        this.variation.companionClickTrackingURLTemplates;
    }
  }

  /**
   * Sets the duration of the ad and updates the quartiles based on that.
   *
   * @param  {Number} duration - The duration of the ad.
   */
  setDuration(duration) {
    // check if duration is a valid time input
    if (!util.isValidTimeValue(duration)) {
      this.emit("TRACKER-error", {
        message: `the duration provided is not valid. duration: ${duration}`,
      });
      return;
    }
    this.assetDuration = duration;
    // beware of key names, theses are also used as event names
    this.quartiles = {
      firstQuartile: Math.round(25 * this.assetDuration) / 100,
      midpoint: Math.round(50 * this.assetDuration) / 100,
      thirdQuartile: Math.round(75 * this.assetDuration) / 100,
    };
  }

  /**
   * Sets the duration of the ad and updates the quartiles based on that.
   * This is required for tracking time related events.
   *
   * @param {Number} progress - Current playback time in seconds.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#start
   * @emits VASTTracker#skip-countdown
   * @emits VASTTracker#progress-[0-100]%
   * @emits VASTTracker#progress-[currentTime]
   * @emits VASTTracker#rewind
   * @emits VASTTracker#firstQuartile
   * @emits VASTTracker#midpoint
   * @emits VASTTracker#thirdQuartile
   */
  setProgress(progress, macros = {}, trackOnce = true) {
    // check if progress is a valid time input
    if (!util.isValidTimeValue(progress) || typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `One given setProgress parameter has the wrong type. progress: ${progress}, macros: ${util.formatMacrosValues(
          macros,
        )}`,
      });

      return;
    }

    const skipDelay = this.skipDelay || DEFAULT_SKIP_DELAY;

    if (skipDelay !== -1 && !this.skippable) {
      if (skipDelay > progress) {
        this.emit("skip-countdown", skipDelay - progress);
      } else {
        this.skippable = true;
        this.emit("skip-countdown", 0);
      }
    }

    if (this.assetDuration > 0) {
      const percent = Math.round((progress / this.assetDuration) * 100);
      const events = [];
      if (progress > 0) {
        events.push("start");
        for (let i = this.lastPercentage; i < percent; i++) {
          events.push(`progress-${i + 1}%`);
        }
        events.push(`progress-${Math.round(progress)}`);
        for (const quartile in this.quartiles) {
          if (
            this.isQuartileReached(quartile, this.quartiles[quartile], progress)
          ) {
            events.push(quartile);
            this._alreadyTriggeredQuartiles[quartile] = true;
          }
        }
        this.lastPercentage = percent;
      }
      events.forEach((eventName) => {
        this.track(eventName, { macros, once: trackOnce });
      });

      if (progress < this.progress) {
        this.track("rewind", { macros });
      }
    }

    this.progress = progress;
  }

  /**
   * Checks if a quartile has been reached without have being triggered already.
   *
   * @param {String} quartile - Quartile name
   * @param {Number} time - Time offset of the quartile, when this quartile is reached in seconds.
   * @param {Number} progress - Current progress of the ads in seconds.
   *
   * @return {Boolean}
   */
  isQuartileReached(quartile, time, progress) {
    let quartileReached = false;
    // if quartile time already reached and never triggered
    if (time <= progress && !this._alreadyTriggeredQuartiles[quartile]) {
      quartileReached = true;
    }
    return quartileReached;
  }

  /**
   * Updates the mute state and calls the mute/unmute tracking URLs.
   *
   * @param {Boolean} muted - Indicates if the video is muted or not.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#mute
   * @emits VASTTracker#unmute
   */
  setMuted(muted, macros = {}) {
    if (typeof muted !== "boolean" || typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `One given setMuted parameter has the wrong type. muted: ${muted}, macros: ${util.formatMacrosValues(
          macros,
        )}`,
      });
      return;
    }

    if (this.muted !== muted) {
      this.track(muted ? "mute" : "unmute", { macros });
    }
    this.muted = muted;
  }

  /**
   * Update the pause state and call the resume/pause tracking URLs.
   *
   * @param {Boolean} paused - Indicates if the video is paused or not.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#pause
   * @emits VASTTracker#resume
   */
  setPaused(paused, macros = {}) {
    if (typeof paused !== "boolean" || typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `One given setPaused parameter has the wrong type. paused: ${paused}, macros: ${util.formatMacrosValues(
          macros,
        )}`,
      });
      return;
    }
    if (this.paused !== paused) {
      this.track(paused ? "pause" : "resume", { macros });
    }
    this.paused = paused;
  }

  /**
   * Updates the fullscreen state and calls the fullscreen tracking URLs.
   *
   * @param {Boolean} fullscreen - Indicates if the video is in fulscreen mode or not.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#fullscreen
   * @emits VASTTracker#exitFullscreen
   */
  setFullscreen(fullscreen, macros = {}) {
    if (typeof fullscreen !== "boolean" || typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `One given setFullScreen parameter has the wrong type. fullscreen: ${fullscreen}, macros: ${util.formatMacrosValues(
          macros,
        )}`,
      });
      return;
    }
    if (this.fullscreen !== fullscreen) {
      this.track(fullscreen ? "fullscreen" : "exitFullscreen", { macros });
    }
    this.fullscreen = fullscreen;
  }

  /**
   * Updates the expand state and calls the expand/collapse tracking URLs.
   *
   * @param {Boolean} expanded - Indicates if the video is expanded or not.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#expand
   * @emits VASTTracker#playerExpand
   * @emits VASTTracker#collapse
   * @emits VASTTracker#playerCollapse
   */
  setExpand(expanded, macros = {}) {
    if (typeof expanded !== "boolean" || typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `One given setExpand parameter has the wrong type. expanded: ${expanded}, macros: ${util.formatMacrosValues(
          macros,
        )}`,
      });
      return;
    }

    if (this.expanded !== expanded) {
      this.track(expanded ? "expand" : "collapse", { macros });
      this.track(expanded ? "playerExpand" : "playerCollapse", { macros });
    }
    this.expanded = expanded;
  }

  /**
   * Must be called if you want to overwrite the <Linear> Skipoffset value.
   * This will init the skip countdown duration. Then, every time setProgress() is called,
   * it will decrease the countdown and emit a skip-countdown event with the remaining time.
   * Do not call this method if you want to keep the original Skipoffset value.
   *
   * @param {Number} duration - The time in seconds until the skip button is displayed.
   */
  setSkipDelay(duration) {
    if (!util.isValidTimeValue(duration)) {
      this.emit("TRACKER-error", {
        message: `setSkipDelay parameter does not have a valid value. duration: ${duration}`,
      });
      return;
    }
    this.skipDelay = duration;
  }

  /**
   * Tracks an impression (can be called only once).
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#creativeView
   */
  trackImpression(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `trackImpression parameter has the wrong type. macros: ${macros}`,
      });
      return;
    }
    if (!this.impressed) {
      this.impressed = true;
      this.trackURLs(this.ad.impressionURLTemplates, macros);
      this.track("creativeView", { macros });
    }
  }

  /**
   * Tracks Viewable impression
   * @param {Object} [macros = {}] An optional Object containing macros and their values to be used and replaced in the tracking calls.
   */
  trackViewableImpression(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `trackViewableImpression given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.ad.viewableImpression.forEach((impression) => {
      this.trackURLs(impression.viewable, macros);
    });
  }

  /**
   * Tracks NotViewable impression
   * @param {Object} [macros = {}] An optional Object containing macros and their values to be used and replaced in the tracking calls.
   */

  trackNotViewableImpression(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `trackNotViewableImpression given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }

    this.ad.viewableImpression.forEach((impression) => {
      this.trackURLs(impression.notViewable, macros);
    });
  }

  /**
   * Tracks ViewUndetermined impression
   * @param {Object} [macros = {}] An optional Object containing macros and their values to be used and replaced in the tracking calls.
   */
  trackUndeterminedImpression(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `trackUndeterminedImpression given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }

    this.ad.viewableImpression.forEach((impression) => {
      this.trackURLs(impression.viewUndetermined, macros);
    });
  }

  /**
   * Send a request to the URI provided by the VAST <Error> element.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
   */
  error(macros = {}, isCustomCode = false) {
    if (typeof macros !== "object" || typeof isCustomCode !== "boolean") {
      this.emit("TRACKER-error", {
        message: `One given error parameter has the wrong type. macros: ${util.formatMacrosValues(
          macros,
        )}, isCustomCode: ${isCustomCode}`,
      });
      return;
    }
    this.trackURLs(this.ad.errorURLTemplates, macros, { isCustomCode });
  }

  /**
   * Send a request to the URI provided by the VAST <Error> element.
   * If an [ERRORCODE] macro is included, it will be substitute with errorCode.
   * @deprecated
   * @param {String} errorCode - Replaces [ERRORCODE] macro. [ERRORCODE] values are listed in the VAST specification.
   * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
   */
  errorWithCode(errorCode, isCustomCode = false) {
    if (typeof errorCode !== "string" || typeof isCustomCode !== "boolean") {
      this.emit("TRACKER-error", {
        message: `One given errorWithCode parameter has the wrong type. errorCode: ${errorCode}, isCustomCode: ${isCustomCode}`,
      });
      return;
    }
    this.error({ ERRORCODE: errorCode }, isCustomCode);
    //eslint-disable-next-line
    console.log(
      "The method errorWithCode is deprecated, please use vast tracker error method instead",
    );
  }

  /**
   * Must be called when the user watched the linear creative until its end.
   * Calls the complete tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#complete
   */
  complete(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `complete given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.track("complete", { macros });
  }

  /**
   * Must be called if the ad was not and will not be played
   * This is a terminal event; no other tracking events should be sent when this is used.
   * Calls the notUsed tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#notUsed
   */
  notUsed(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `notUsed given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.track("notUsed", { macros });
    this.trackingEvents = [];
  }

  /**
   * An optional metric that can capture all other user interactions
   * under one metric such as hover-overs, or custom clicks. It should NOT replace
   * clickthrough events or other existing events like mute, unmute, pause, etc.
   * Calls the otherAdInteraction tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#otherAdInteraction
   */
  otherAdInteraction(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `otherAdInteraction given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.track("otherAdInteraction", { macros });
  }

  /**
   * Must be called if the user clicked or otherwise activated a control used to
   * pause streaming content,* which either expands the ad within the player’s
   * viewable area or “takes-over” the streaming content area by launching
   * additional portion of the ad.
   * Calls the acceptInvitation tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#acceptInvitation
   */
  acceptInvitation(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `acceptInvitation given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.track("acceptInvitation", { macros });
  }

  /**
   * Must be called if user activated a control to expand the creative.
   * Calls the adExpand tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#adExpand
   */
  adExpand(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `adExpand given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.track("adExpand", { macros });
  }

  /**
   * Must be called when the user activated a control to reduce the creative to its original dimensions.
   * Calls the adCollapse tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#adCollapse
   */
  adCollapse(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `adCollapse given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.track("adCollapse", { macros });
  }

  /**
   * Must be called if the user clicked or otherwise activated a control used to minimize the ad.
   * Calls the minimize tracking URLs.
   *
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#minimize
   */
  minimize(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `minimize given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.track("minimize", { macros });
  }

  /**
   * Must be called if the player did not or was not able to execute the provided
   * verification code.The [REASON] macro must be filled with reason code
   * Calls the verificationNotExecuted tracking URL of associated verification vendor.
   *
   * @param {String} vendor - An identifier for the verification vendor. The recommended format is [domain]-[useCase], to avoid name collisions. For example, "company.com-omid".
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#verificationNotExecuted
   */
  verificationNotExecuted(vendor, macros = {}) {
    if (typeof vendor !== "string" || typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `One given verificationNotExecuted parameter has to wrong type. vendor: ${vendor}, macros: ${util.formatMacrosValues(
          macros,
        )}`,
      });
      return;
    }
    if (
      !this.ad ||
      !this.ad.adVerifications ||
      !this.ad.adVerifications.length
    ) {
      throw new Error("No adVerifications provided");
    }

    if (!vendor) {
      throw new Error(
        "No vendor provided, unable to find associated verificationNotExecuted",
      );
    }

    const vendorVerification = this.ad.adVerifications.find(
      (verifications) => verifications.vendor === vendor,
    );

    if (!vendorVerification) {
      throw new Error(
        `No associated verification element found for vendor: ${vendor}`,
      );
    }
    const vendorTracking = vendorVerification.trackingEvents;

    if (vendorTracking && vendorTracking.verificationNotExecuted) {
      const verifsNotExecuted = vendorTracking.verificationNotExecuted;
      this.trackURLs(verifsNotExecuted, macros);
      this.emit("verificationNotExecuted", {
        trackingURLTemplates: verifsNotExecuted,
      });
    }
  }

  /**
   * The time that the initial ad is displayed. This time is based on
   * the time between the impression and either the completed length of display based
   * on the agreement between transactional parties or a close, minimize, or accept
   * invitation event.
   * The time will be passed using [ADPLAYHEAD] macros for VAST 4.1
   * Calls the overlayViewDuration tracking URLs.
   *
   * @param {String} formattedDuration - The time that the initial ad is displayed.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#overlayViewDuration
   */
  overlayViewDuration(formattedDuration, macros = {}) {
    if (typeof formattedDuration !== "string" || typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `One given overlayViewDuration parameters has the wrong type. formattedDuration: ${formattedDuration}, macros: ${util.formatMacrosValues(
          macros,
        )}`,
      });
      return;
    }
    macros["ADPLAYHEAD"] = formattedDuration;
    this.track("overlayViewDuration", { macros });
  }

  /**
   * Must be called when the player or the window is closed during the ad.
   * Calls the `closeLinear` (in VAST 3.0 and 4.1) and `close` tracking URLs.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   *
   * @emits VASTTracker#closeLinear
   * @emits VASTTracker#close
   */
  close(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `close given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.track(this.linear ? "closeLinear" : "close", { macros });
  }

  /**
   * Must be called when the skip button is clicked. Calls the skip tracking URLs.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   *
   * @emits VASTTracker#skip
   */
  skip(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `skip given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.track("skip", { macros });
  }

  /**
   * Must be called then loaded and buffered the creative’s media and assets either fully
   * or to the extent that it is ready to play the media
   * Calls the loaded tracking URLs.
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   *
   * @emits VASTTracker#loaded
   */
  load(macros = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `load given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    this.track("loaded", { macros });
  }

  /**
   * Must be called when the user clicks on the creative.
   * It calls the tracking URLs and emits a 'clickthrough' event with the resolved
   * clickthrough URL when done.
   *
   * @param {?String} [fallbackClickThroughURL=null] - an optional clickThroughURL template that could be used as a fallback
   * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
   * @emits VASTTracker#clickthrough
   */
  click(fallbackClickThroughURL = null, macros = {}) {
    if (
      (fallbackClickThroughURL !== null &&
        typeof fallbackClickThroughURL !== "string") ||
      typeof macros !== "object"
    ) {
      this.emit("TRACKER-error", {
        message: `One given click parameter has the wrong type. fallbackClickThroughURL: ${fallbackClickThroughURL}, macros: ${util.formatMacrosValues(
          macros,
        )}`,
      });
      return;
    }
    if (
      this.clickTrackingURLTemplates &&
      this.clickTrackingURLTemplates.length
    ) {
      this.trackURLs(this.clickTrackingURLTemplates, macros);
    }

    // Use the provided fallbackClickThroughURL as a fallback
    const clickThroughURLTemplate =
      this.clickThroughURLTemplate || fallbackClickThroughURL;
    // clone second usage of macros, which get mutated inside resolveURLTemplates
    const clonedMacros = { ...macros };

    if (clickThroughURLTemplate) {
      if (this.progress) {
        clonedMacros["ADPLAYHEAD"] = this.progressFormatted();
      }
      const clickThroughURL = util.resolveURLTemplates(
        [clickThroughURLTemplate],
        clonedMacros,
      )[0];

      this.emit("clickthrough", clickThroughURL);
    }
  }

  /**
   * Calls the tracking URLs for the given eventName and emits the event.
   *
   * @param {String} eventName - The name of the event.
   * @param {Object} options
   * @param {Object} [options.macros={}] - An optional Object of parameters(vast macros) to be used in the tracking calls.
   * @param {Boolean} [options.once=false] - Boolean to define if the event has to be tracked only once.
   *
   */
  track(eventName, { macros = {}, once = false } = {}) {
    if (typeof macros !== "object") {
      this.emit("TRACKER-error", {
        message: `track given macros has the wrong type. macros: ${macros}`,
      });
      return;
    }
    // closeLinear event was introduced in VAST 3.0
    // Fallback to vast 2.0 close event if necessary
    if (
      eventName === "closeLinear" &&
      !this.trackingEvents[eventName] &&
      this.trackingEvents["close"]
    ) {
      eventName = "close";
    }

    const trackingURLTemplates = this.trackingEvents[eventName];
    const isAlwaysEmitEvent = this.emitAlwaysEvents.indexOf(eventName) > -1;

    if (trackingURLTemplates) {
      this.emit(eventName, { trackingURLTemplates });
      this.trackURLs(trackingURLTemplates, macros);
    } else if (isAlwaysEmitEvent) {
      this.emit(eventName, null);
    }

    if (once) {
      delete this.trackingEvents[eventName];
      if (isAlwaysEmitEvent) {
        this.emitAlwaysEvents.splice(
          this.emitAlwaysEvents.indexOf(eventName),
          1,
        );
      }
    }
  }

  /**
   * Calls the tracking urls templates with the given macros .
   *
   * @param {Array} URLTemplates - An array of tracking url templates.
   * @param {Object} [macros ={}] - An optional Object of parameters to be used in the tracking calls.
   * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
   */
  trackURLs(URLTemplates, macros = {}, options = {}) {
    const { validUrls, invalidUrls } = util.filterUrlTemplates(URLTemplates);

    if (invalidUrls.length) {
      this.emit("TRACKER-error", {
        message: `Provided urls are malformed. url: ${invalidUrls}`,
      });
    }

    //Avoid mutating the object received in parameters.
    const givenMacros = { ...macros };
    if (this.linear) {
      if (
        this.creative &&
        this.creative.mediaFiles &&
        this.creative.mediaFiles[0] &&
        this.creative.mediaFiles[0].fileURL
      ) {
        givenMacros["ASSETURI"] = this.creative.mediaFiles[0].fileURL;
      }
      if (this.progress) {
        givenMacros["ADPLAYHEAD"] = this.progressFormatted();
      }
    }

    if (this.creative?.universalAdIds?.length) {
      givenMacros["UNIVERSALADID"] = this.creative.universalAdIds
        .map((universalAdId) =>
          universalAdId.idRegistry.concat(" ", universalAdId.value),
        )
        .join(",");
    }

    if (this.ad) {
      if (this.ad.sequence) {
        givenMacros["PODSEQUENCE"] = this.ad.sequence;
      }
      if (this.ad.adType) {
        givenMacros["ADTYPE"] = this.ad.adType;
      }
      if (this.ad.adServingId) {
        givenMacros["ADSERVINGID"] = this.ad.adServingId;
      }
      if (this.ad.categories && this.ad.categories.length) {
        givenMacros["ADCATEGORIES"] = this.ad.categories
          .map((category) => category.value)
          .join(",");
      }
      if (this.ad.blockedAdCategories && this.ad.blockedAdCategories.length) {
        givenMacros["BLOCKEDADCATEGORIES"] = this.ad.blockedAdCategories
          .map((blockedCategorie) => blockedCategorie.value)
          .join(",");
      }
    }

    util.track(validUrls, givenMacros, options);
  }

  /**
   * Formats time in seconds to VAST timecode (e.g. 00:00:10.000)
   *
   * @param {Number} timeInSeconds - Number in seconds
   * @return {String}
   */
  convertToTimecode(timeInSeconds) {
    if (!util.isValidTimeValue(timeInSeconds)) {
      return "";
    }
    const progress = timeInSeconds * 1000;
    const hours = Math.floor(progress / (60 * 60 * 1000));
    const minutes = Math.floor((progress / (60 * 1000)) % 60);
    const seconds = Math.floor((progress / 1000) % 60);
    const milliseconds = Math.floor(progress % 1000);
    return `${util.addLeadingZeros(hours, 2)}:${util.addLeadingZeros(
      minutes,
      2,
    )}:${util.addLeadingZeros(seconds, 2)}.${util.addLeadingZeros(
      milliseconds,
      3,
    )}`;
  }

  /**
   * Formats time progress in a readable string.
   *
   * @return {String}
   */
  progressFormatted() {
    return this.convertToTimecode(this.progress);
  }
}
