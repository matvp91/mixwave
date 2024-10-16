type Fn = CallableFunction;
type FnTuple = [Fn, Fn];

export class EventManager<On extends Fn, Off extends Fn> {
  on: On;

  off: Off;

  private listeners_: Record<string, FnTuple[]> = {};

  constructor(
    private params_: {
      on: On;
      off: Off;
    },
  ) {
    this.on = this.addListener_ as unknown as On;
    this.off = this.removeListener_ as unknown as Off;
  }

  private addListener_ = (event: string, callback: () => void) => {
    const listener = wrapInLog(callback);

    if (!this.listeners_[event]) {
      this.listeners_[event] = [];
    }
    this.listeners_[event].push([listener, callback]);

    this.params_.on(event, listener);
  };

  private removeListener_ = (event: string, callback: () => void) => {
    const lookupMap = this.listeners_[event];
    if (!lookupMap) {
      return;
    }

    const listener = lookupMap.find((listener) => {
      return listener[1] === callback;
    });
    if (!listener) {
      return;
    }

    this.params_.off(event, listener[0]);

    const index = this.listeners_[event].indexOf(listener);
    if (index > -1) {
      this.listeners_[event].splice(index, 1);
    }

    if (!this.listeners_[event].length) {
      delete this.listeners_[event];
    }
  };

  releaseAll() {
    Object.entries(this.listeners_).forEach(([event, listeners]) => {
      listeners.forEach((listener) => {
        this.params_.off(event, listener[0]);
      });
    });
    this.listeners_ = {};
  }
}

function wrapInLog<T extends (...args: unknown[]) => void>(callback: T) {
  const fn = async (...args: unknown[]) => {
    try {
      await callback(...args);
    } catch (error) {
      console.error(error);
    }
  };
  return fn;
}
