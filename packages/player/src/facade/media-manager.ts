import type { HlsAssetPlayer } from "hls.js";

export class MediaManager {
  /**
   * All additional media elements besides the primary.
   */
  private mediaElements_: HTMLMediaElement[] = [];

  private index_ = 0;

  constructor(
    private media_: HTMLMediaElement,
    private multiple_: boolean,
  ) {
    if (this.multiple_) {
      this.createMediaElements_();
    }
  }

  attachMedia(player: HlsAssetPlayer) {
    if (!this.multiple_) {
      // We do not want to use multiple video elements.
      return;
    }

    // Grab a media element from the pool and bump index for the next.
    const media = this.mediaElements_[this.index_];
    this.index_ += 1;
    this.index_ %= this.mediaElements_.length;

    player.attachMedia(media);
  }

  setActive(player: HlsAssetPlayer) {
    if (
      !player.media ||
      // This is not a mediaElement that we created.
      !this.mediaElements_.includes(player.media)
    ) {
      return;
    }
    this.forwardMedia_(player.media);
  }

  reset() {
    // Set the primary element back to front.
    this.forwardMedia_(this.media_);
  }

  setVolume(volume: number) {
    this.media_.volume = volume;
    for (const media of this.mediaElements_) {
      media.volume = volume;
    }
  }

  private createMediaElements_() {
    if (this.media_.parentElement?.tagName !== "DIV") {
      throw new Error("The parent of the media element is not a div.");
    }

    const container = this.media_.parentElement as HTMLDivElement;
    // Create 2 video elements so we can transition smoothly from one
    // interstitial to the other.
    this.mediaElements_.push(createVideoElement(), createVideoElement());
    container.prepend(...this.mediaElements_);

    this.forwardMedia_(this.media_);
  }

  /**
   * Bring a media element to foreground.
   * @param target
   */
  private forwardMedia_(target: HTMLMediaElement) {
    let found = false;
    for (const media of this.mediaElements_) {
      if (target === media) {
        media.style.zIndex = "0";
        found = true;
      } else {
        media.style.zIndex = "-1";
      }
    }

    // If we found a sub media element, we hide primary.
    this.media_.style.zIndex = found ? "-1" : "0";
  }
}

function createVideoElement() {
  const el = document.createElement("video");
  el.style.position = "absolute";
  el.style.inset = "0";
  el.style.width = "100%";
  el.style.height = "100%";
  return el;
}
