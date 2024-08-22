export class EventEmitter {
  constructor() {
    this._handlers = [];
  }

  /**
   * Adds the event name and handler function to the end of the handlers array.
   * No checks are made to see if the handler has already been added.
   * Multiple calls passing the same combination of event name and handler will result in the handler being added,
   * and called, multiple times.
   * @param {String} event
   * @param {Function} handler
   * @returns {EventEmitter}
   */
  on(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError(
        `The handler argument must be of type Function. Received type ${typeof handler}`
      );
    }
    if (!event) {
      throw new TypeError(
        `The event argument must be of type String. Received type ${typeof event}`
      );
    }
    this._handlers.push({
      event,
      handler,
    });

    return this;
  }

  /**
   * Adds a one-time handler function for the named event.
   * The next time event is triggered, this handler is removed and then invoked.
   * @param {String} event
   * @param {Function} handler
   * @returns {EventEmitter}
   */
  once(event, handler) {
    return this.on(event, onceWrap(this, event, handler));
  }

  /**
   * Removes all instances for the specified handler from the handler array for the named event.
   * @param {String} event
   * @param {Function} handler
   * @returns {EventEmitter}
   */
  off(event, handler) {
    this._handlers = this._handlers.filter((item) => {
      return item.event !== event || item.handler !== handler;
    });

    return this;
  }

  /**
   * Synchronously calls each of the handlers registered for the named event,
   * in the order they were registered, passing the supplied arguments to each.
   * @param {String} event
   * @param  {...any} args list of arguments that will be used by the event handler
   * @returns {Boolean} true if the event had handlers, false otherwise.
   */
  emit(event, ...args) {
    let called = false;
    this._handlers.forEach((item) => {
      if (item.event === '*') {
        called = true;
        item.handler(event, ...args);
      }
      if (item.event === event) {
        called = true;
        item.handler(...args);
      }
    });
    return called;
  }

  /**
   * Removes all listeners, or those of the specified named event.
   * @param {String} event
   * @returns {EventEmitter}
   */
  removeAllListeners(event) {
    if (!event) {
      this._handlers = [];
      return this;
    }

    this._handlers = this._handlers.filter((item) => item.event !== event);
    return this;
  }

  /**
   * Returns the number of listeners listening to the named event.
   * @param {String} event
   * @returns {Number}
   */
  listenerCount(event) {
    return this._handlers.filter((item) => item.event === event).length;
  }

  /**
   * Returns a copy of the array of listeners for the named event including those created by .once().
   * @param {String} event
   * @returns {Function[]}
   */
  listeners(event) {
    return this._handlers.reduce((listeners, item) => {
      if (item.event === event) {
        listeners.push(item.handler);
      }
      return listeners;
    }, []);
  }

  /**
   * Returns an array listing the events for which the emitter has registered handlers.
   * @returns {String[]}
   */
  eventNames() {
    return this._handlers.map((item) => item.event);
  }
}

function onceWrap(target, event, handler) {
  const state = {
    fired: false,
    wrapFn: undefined,
  };

  function onceWrapper(...args) {
    if (!state.fired) {
      target.off(event, state.wrapFn);
      state.fired = true;
      handler.bind(target)(...args);
    }
  }
  state.wrapFn = onceWrapper;
  return onceWrapper;
}
