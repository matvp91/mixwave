export class Timer {
  private timerId_?: NodeJS.Timer;

  constructor(private onTick_: () => void) {}

  tickNow() {
    this.stop();

    this.onTick_();

    return this;
  }

  tickAfter(seconds: number) {
    this.stop();

    this.timerId_ = setTimeout(() => {
      this.onTick_();
    }, seconds * 1000);

    return this;
  }

  tickEvery(seconds: number) {
    this.stop();

    this.timerId_ = setTimeout(() => {
      this.onTick_();
      this.tickEvery(seconds);
    }, seconds * 1000);

    return this;
  }

  stop() {
    clearTimeout(this.timerId_);
  }
}
