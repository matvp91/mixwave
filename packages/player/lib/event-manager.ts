import type Hls from "hls.js";
import type { HlsListeners } from "hls.js";

type HlsListener<E extends keyof HlsListeners = keyof HlsListeners> = [
  event: E,
  listener: HlsListeners[E],
];

type MediaListener<
  K extends keyof HTMLMediaElementEventMap = keyof HTMLMediaElementEventMap,
> = [
  type: K,
  listener: (this: HTMLMediaElement, ev: HTMLMediaElementEventMap[K]) => void,
];

export class EventManager {
  private hlsListeners_: HlsListener[] = [];

  private mediaListeners_: MediaListener[] = [];

  constructor(
    private hls_: Hls,
    private media_: HTMLMediaElement,
  ) {
    this.mediaOn = this.mediaOn.bind(this);
    this.hlsOn = this.hlsOn.bind(this);
    this.hlsOff = this.hlsOff.bind(this);
  }

  mediaOn<K extends keyof HTMLMediaElementEventMap>(
    type: K,
    listener: (this: HTMLMediaElement, ev: HTMLMediaElementEventMap[K]) => void,
  ) {
    this.media_.addEventListener(type, listener);
    // @ts-expect-error
    this.mediaListeners_.push([type, listener]);
  }

  hlsOn<E extends keyof HlsListeners>(event: E, listener: HlsListeners[E]) {
    // hls.js swallows errors, let's explicitly log them by wrapping the listener
    // in a logCall. We wouldn't want to miss any exception by accident.
    const logListener = logCall(listener);
    this.hls_.on(event, logListener);
    this.hlsListeners_.push([event, logListener]);
  }

  hlsOff<E extends keyof HlsListeners>(event: E, listener: HlsListeners[E]) {
    for (const lookup of this.hlsListeners_) {
      // @ts-expect-error
      if (lookup[1][logCallOrig] === listener) {
        // @ts-expect-error
        listener = lookup[1];
        console.log("FOUND IT");
        break;
      }
    }
    this.hls_.off(event, listener);

    const listenerIndex = this.hlsListeners_.findIndex(
      ([, lookupListener]) => listener === lookupListener,
    );

    if (listenerIndex > -1) {
      this.hlsListeners_.splice(listenerIndex, 1);
    }
  }

  releaseAll() {
    this.mediaListeners_.forEach(([type, listener]) => {
      this.media_.removeEventListener(type, listener);
    });
    this.mediaListeners_ = [];

    this.hlsListeners_.forEach(([event, listener]) => {
      this.hls_.off(event, listener);
    });
    this.hlsListeners_ = [];
  }
}

const logCallOrig = Symbol.for("mixwave.logCallOrig");

function logCall<T extends (...args: any) => any>(callback: T) {
  const fn = async (...args: any) => {
    try {
      await callback(...args);
    } catch (error) {
      console.error(error);
    }
  };

  fn[logCallOrig] = callback;

  return fn;
}
