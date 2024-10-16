export class Poller {
  private timerId_?: Timer;

  constructor(
    private timeoutMs_: number,
    private callback_: () => void,
  ) {}

  stop() {
    clearTimeout(this.timerId_);
  }

  run = () => {
    clearTimeout(this.timerId_);
    this.timerId_ = setTimeout(this.run, this.timeoutMs_);

    this.callback_();
  };
}
