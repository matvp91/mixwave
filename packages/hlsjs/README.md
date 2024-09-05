# hls.js wrapper

Using https://www.svgrepo.com/collection/solar-broken-line-icons for icons.

## Bugs

- When we have a preroll interstitial and we select the subtitle, it will only respect the first selected subtitle. Changing subtitle afterwards has no effect.

- When interstitials startTime is beyond the end of the content duration, there are stalls sometimes and content stops buffering. This can be replicated manually when setting interstitials further away.
