import { DEFAULT_TIMEOUT } from "./consts.js";
import { util } from "../util/util.js";

/**
 * Return an object containing an XML document.
 * in addition to the byteLength and the statusCode of the response.
 * @param {Object} response the response of the fetch request.
 * @returns {Object}
 */
async function handleResponse(response) {
  const textXml = await response.text();
  let parser;

  if (!util.isBrowserEnvironment()) {
    const xmlDom = await import("@xmldom/xmldom");
    parser = new xmlDom.DOMParser();
  } else {
    parser = new DOMParser();
  }

  const xml = parser.parseFromString(textXml, "text/xml");
  return {
    xml,
    details: {
      byteLength: textXml.length,
      statusCode: response.status,
      rawXml: textXml,
    },
  };
}

/**
 * Return a custom message if an error occured
 * @param {Object} response The response of fetch request
 * @returns {String | null}
 */
function handleError(response) {
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    response.url.includes("http://")
  ) {
    return "URLHandler: Cannot go from HTTPS to HTTP.";
  }

  if (response.status !== 200 || !response.ok) {
    return `URLHandler: ${response.statusText} (${response.status})`;
  }
  return null;
}

async function get(url, options) {
  try {
    // fetch does not have "timeout" option, we are using AbortController
    // to abort the request if it reach the timeout.
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      throw new Error(
        `URLHandler: Request timed out after ${
          options.timeout || DEFAULT_TIMEOUT
        } ms (408)`,
      );
    }, options.timeout || DEFAULT_TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: options.withCredentials ? "include" : "omit",
    });
    clearTimeout(timer);

    const error = handleError(response);
    if (error) {
      return { error: new Error(error), statusCode: response.status };
    }
    return handleResponse(response);
  } catch (error) {
    return {
      error,
      statusCode: error.name === "AbortError" ? 408 : null,
    };
  }
}

export const urlHandler = {
  get,
};
