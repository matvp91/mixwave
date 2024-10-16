export class Tick {
  private timerId_?: Timer;

  constructor(
    private timeoutMs_: number,
    private callback_: () => void,
  ) {}

  tick() {
    clearTimeout(this.timerId_);

    this.timerId_ = setTimeout(() => {
      this.tick();
    }, this.timeoutMs_);

    this.callback_();
  }

  stop() {
    clearTimeout(this.timerId_);
  }
}
