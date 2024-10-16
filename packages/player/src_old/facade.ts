import Hls from "hls.js";
import EventEmitter from "eventemitter3";
import { assert } from "./assert";
import { Session } from "./session";
import type { Events } from "./types";

export class HlsFacade extends EventEmitter<Events> {
  media: HTMLMediaElement;

  private session_: Session | null = null;

  constructor(public hls: Hls) {
    super();

    assert(
      hls.media,
      "No media element, call hls.attachMedia before initialising facade.",
    );

    this.media = hls.media;

    hls.on(Hls.Events.BUFFER_RESET, this.bufferReset_);
    hls.on(Hls.Events.MANIFEST_LOADED, this.manifestLoaded_);
  }

  private bufferReset_ = () => {
    this.session_?.dispose();
    this.session_ = null;
    this.emit("*");
  };

  private manifestLoaded_ = () => {
    if (this.session_) {
      this.bufferReset_();
    }
    this.session_ = new Session(this);
    this.emit("*");
  };

  get loaded() {
    return this.session_ !== null;
  }

  get playheadState() {
    return this.session_?.playheadState ?? "idle";
  }

  get started() {
    return this.session_?.started ?? false;
  }

  get time() {
    return this.session_?.time ?? NaN;
  }

  get duration() {
    return this.session_?.duration ?? NaN;
  }

  get volume() {
    return this.session_?.volume ?? NaN;
  }

  get slot() {
    return this.session_?.slot ?? null;
  }

  get autoQuality() {
    return this.session_?.autoQuality ?? false;
  }

  get qualities() {
    return this.session_?.qualities ?? [];
  }

  get audioTracks() {
    return this.session_?.audioTracks ?? [];
  }

  get subtitleTracks() {
    return this.session_?.subtitleTracks ?? [];
  }

  get cuePoints() {
    return this.session_?.cuePoints ?? [];
  }

  /**
   * Toggles play or pause.
   */
  playOrPause() {
    this.session_?.playOrPause();
  }

  /**
   * Seek to a time in primary content.
   * @param targetTime
   */
  seekTo(targetTime: number) {
    this.session_?.seekTo(targetTime);
  }

  /**
   * Sets volume.
   * @param volume
   */
  setVolume(volume: number) {
    this.session_?.setVolume(volume);
  }

  /**
   * Sets quality by id. All quality levels are defined in `State`.
   * @param id
   */
  setQuality(height: number | null) {
    this.session_?.setQuality(height);
  }

  /**
   * Sets subtitle by id. All subtitle tracks are defined in `State`.
   * @param id
   */
  setSubtitleTrack(id: number | null) {
    this.session_?.setSubtitleTrack(id);
  }

  /**
   * Sets audio by id. All audio tracks are defined in `State`.
   * @param id
   */
  setAudioTrack(id: number) {
    this.session_?.setAudioTrack(id);
  }

  dispose() {
    this.session_?.dispose();
    this.session_ = null;
  }
}
