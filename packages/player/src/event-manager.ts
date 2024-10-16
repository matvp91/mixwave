type Handler = (...args: any) => any;

type Target = {
  addEventListener?: Handler;
  removeEventListener?: Handler;
  on?: Handler;
  off?: Handler;
};

type AddCallback<T extends Target> = T extends { addEventListener: Handler }
  ? T["addEventListener"]
  : T extends { on: Handler }
    ? T["on"]
    : Handler;

type RemoveCallback<T extends Target> = T extends {
  removeEventListener: Handler;
}
  ? T["removeEventListener"]
  : T extends { off: Handler }
    ? T["off"]
    : Handler;

export class EventManager {
  private bindings_ = new Set<Binding>();

  listen = <T extends Target>(target: T) =>
    ((type, listener, context) => {
      const binding = new Binding(target, type, listener, context);
      this.bindings_.add(binding);
    }) as AddCallback<T>;

  listenOnce = <T extends Target>(target: T) =>
    ((type, listener, context) => {
      const binding = new Binding(
        target,
        type,
        listener,
        context,
        /* once= */ true,
      );
      this.bindings_.add(binding);
    }) as AddCallback<T>;

  unlisten = <T extends Target>(target: T) =>
    ((type, listener) => {
      const binding = this.bindings_
        .values()
        .find(
          (binding) =>
            binding.target === target &&
            binding.type === type &&
            binding.listener === listener,
        );
      if (binding) {
        binding.remove();
        this.bindings_.delete(binding);
      }
    }) as RemoveCallback<T>;

  removeAll() {
    this.bindings_.forEach((binding) => {
      binding.remove();
    });
    this.bindings_.clear();
  }
}

class Binding {
  private methodMap_ = {
    add:
      this.target.addEventListener?.bind(this.target) ??
      this.target.on?.bind(this.target),
    remove:
      this.target.removeEventListener?.bind(this.target) ??
      this.target.off?.bind(this.target),
  };

  private callback_: Handler;

  constructor(
    public target: Target,
    public type: string,
    public listener: Handler,
    context?: unknown,
    once?: boolean,
  ) {
    this.callback_ = async (...args: unknown[]) => {
      try {
        await this.listener.apply(context, args);
        if (once) {
          this.remove();
        }
      } catch (error) {
        console.error(error);
      }
    };

    this.methodMap_.add?.(this.type, this.callback_);
  }

  remove() {
    this.methodMap_.remove?.(this.type, this.callback_);
  }
}
