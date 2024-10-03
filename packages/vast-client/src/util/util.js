import { supportedMacros } from "./macros.js";

function track(URLTemplates, macros, options) {
  const URLs = resolveURLTemplates(URLTemplates, macros, options);

  URLs.forEach((URL) => {
    if (typeof window !== "undefined" && window !== null) {
      const i = new Image();
      i.src = URL;
    }
  });
}

/**
 * Replace the provided URLTemplates with the given values
 *
 * @param {Array} URLTemplates - An array of tracking url templates.
 * @param {Object} [macros={}] - An optional Object of parameters to be used in the tracking calls.
 * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
 */
function resolveURLTemplates(URLTemplates, macros = {}, options = {}) {
  const resolvedURLs = [];
  const URLArray = extractURLsFromTemplates(URLTemplates);

  // Set default value for invalid ERRORCODE
  if (
    macros["ERRORCODE"] &&
    !options.isCustomCode &&
    !/^[0-9]{3}$/.test(macros["ERRORCODE"])
  ) {
    macros["ERRORCODE"] = 900;
  }

  // Calc random/time based macros
  macros["CACHEBUSTING"] = addLeadingZeros(Math.round(Math.random() * 1.0e8));
  macros["TIMESTAMP"] = new Date().toISOString();

  // RANDOM/random is not defined in VAST 3/4 as a valid macro tho it's used by some adServer (Auditude)
  macros["RANDOM"] = macros["random"] = macros["CACHEBUSTING"];

  for (const macro in macros) {
    macros[macro] = encodeURIComponentRFC3986(macros[macro]);
  }

  for (const URLTemplateKey in URLArray) {
    const resolveURL = URLArray[URLTemplateKey];

    if (typeof resolveURL !== "string") {
      continue;
    }
    resolvedURLs.push(replaceUrlMacros(resolveURL, macros));
  }
  return resolvedURLs;
}

/**
 * Replace the macros tracking url with their value.
 * If no value is provided for a supported macro and it exists in the url,
 * it will be replaced by -1 as described by the VAST 4.1 iab specifications
 *
 * @param {String} url - Tracking url.
 * @param {Object} macros - Object of macros to be replaced in the tracking calls
 */
function replaceUrlMacros(url, macros) {
  url = replaceMacrosValues(url, macros);
  // match any macros from the url that was not replaced
  const remainingMacros = url.match(/[^[\]]+(?=])/g);
  if (!remainingMacros) {
    return url;
  }

  let supportedRemainingMacros = remainingMacros.filter(
    (macro) => supportedMacros.indexOf(macro) > -1,
  );
  if (supportedRemainingMacros.length === 0) {
    return url;
  }

  supportedRemainingMacros = supportedRemainingMacros.reduce(
    (accumulator, macro) => {
      accumulator[macro] = -1;
      return accumulator;
    },
    {},
  );
  return replaceMacrosValues(url, supportedRemainingMacros);
}

/**
 * Replace the macros tracking url with their value.
 *
 * @param {String} url - Tracking url.
 * @param {Object} macros - Object of macros to be replaced in the tracking calls
 */
function replaceMacrosValues(url, macros) {
  let replacedMacrosUrl = url;
  for (const key in macros) {
    const value = macros[key];
    // this will match [${key}] and %%${key}%% and replace it
    replacedMacrosUrl = replacedMacrosUrl.replace(
      new RegExp(`(?:\\[|%%)(${key})(?:\\]|%%)`, "g"),
      value,
    );
  }
  return replacedMacrosUrl;
}

/**
 * Extract the url/s from the URLTemplates.
 *   If the URLTemplates is an array of urls
 *   If the URLTemplates object has a url property
 *   If the URLTemplates is a single string
 *
 * @param {Array|String} URLTemplates - An array|string of url templates.
 */
function extractURLsFromTemplates(URLTemplates) {
  if (Array.isArray(URLTemplates)) {
    return URLTemplates.map((URLTemplate) => {
      return URLTemplate && URLTemplate.hasOwnProperty("url")
        ? URLTemplate.url
        : URLTemplate;
    });
  }
  return URLTemplates;
}

/**
 * Filter URLTemplates elements .
 *   To be valid, urls should:
 *   - have the same protocol as the client
 *   or
 *   - be protocol-relative urls
 *
 * Returns an object with two arrays
 *    - validUrls : An array of valid URLs
 *    - invalidUrls: An array of invalid URLs
 *
 * @param {Array} URLTemplates - A Array of string/object containing urls templates.
 * @returns {Object}
 *
 */
function filterUrlTemplates(URLTemplates) {
  return URLTemplates.reduce(
    (acc, urlTemplate) => {
      const url = urlTemplate.url || urlTemplate;

      isValidUrl(url) ? acc.validUrls.push(url) : acc.invalidUrls.push(url);
      return acc;
    },
    { validUrls: [], invalidUrls: [] },
  );
}

function isValidUrl(url) {
  const regex = /^(https?:\/\/|\/\/)/;
  return regex.test(url);
}

/**
 * Returns a boolean after checking if the object exists in the array.
 *   true - if the object exists, false otherwise
 *
 * @param {Object} obj - The object who existence is to be checked.
 * @param {Array} list - List of objects.
 */
function containsTemplateObject(obj, list) {
  for (let i = 0; i < list.length; i++) {
    if (isTemplateObjectEqual(list[i], obj)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns a boolean after comparing two Template objects.
 *   true - if the objects are equivalent, false otherwise
 *
 * @param {Object} obj1
 * @param {Object} obj2
 */
function isTemplateObjectEqual(obj1, obj2) {
  if (obj1 && obj2) {
    const obj1Properties = Object.getOwnPropertyNames(obj1);
    const obj2Properties = Object.getOwnPropertyNames(obj2);

    // If number of properties is different, objects are not equivalent
    if (obj1Properties.length !== obj2Properties.length) {
      return false;
    }

    if (obj1.id !== obj2.id || obj1.url !== obj2.url) {
      return false;
    }
    return true;
  }
  return false;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function encodeURIComponentRFC3986(str) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16)}`,
  );
}

/**
 * Return a string of the input number with leading zeros defined by the length param
 *
 * @param {Number} input - number to convert
 * @param {Number} length - length of the desired string
 *
 * @return {String}
 */
function addLeadingZeros(input, length = 8) {
  return input.toString().padStart(length, "0");
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function flatten(arr) {
  return arr.reduce((flat, toFlatten) => {
    return flat.concat(
      Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten,
    );
  }, []);
}

/**
 * Joins two arrays of objects without duplicates
 *
 * @param {Array} arr1
 * @param {Array} arr2
 *
 * @return {Array}
 */
function joinArrayOfUniqueTemplateObjs(arr1 = [], arr2 = []) {
  const firstArr = Array.isArray(arr1) ? arr1 : [];
  const secondArr = Array.isArray(arr2) ? arr2 : [];
  const arr = firstArr.concat(secondArr);

  return arr.reduce((res, val) => {
    if (!containsTemplateObject(val, res)) {
      res.push(val);
    }
    return res;
  }, []);
}

/**
 * Check if a provided value is a valid time value according to the IAB definition
 * Check if a provided value is a valid time value according to the IAB definition: Must be a positive number or -1.
 * if not implemented by ad unit or -2 if value is unknown.
 * @param {Number} time
 *
 * @return {Boolean}
 */
function isValidTimeValue(time) {
  return Number.isFinite(time) && time >= -2;
}

/**
 * Check if we are in a browser environment
 * @returns {Boolean}
 */
function isBrowserEnvironment() {
  return typeof window !== "undefined";
}

function formatMacrosValues(macros) {
  return typeof macros !== "object" ? macros : JSON.stringify(macros);
}

export const util = {
  track,
  resolveURLTemplates,
  extractURLsFromTemplates,
  filterUrlTemplates,
  containsTemplateObject,
  isTemplateObjectEqual,
  encodeURIComponentRFC3986,
  replaceUrlMacros,
  isNumeric,
  flatten,
  joinArrayOfUniqueTemplateObjs,
  isValidTimeValue,
  addLeadingZeros,
  isValidUrl,
  isBrowserEnvironment,
  formatMacrosValues,
};
