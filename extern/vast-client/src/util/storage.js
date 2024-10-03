let storage = null;

/**
 * This Object represents a default storage to be used in case no other storage is available.
 * @constant
 * @type {Object}
 */
const DEFAULT_STORAGE = {
  data: {},
  length: 0,
  getItem(key) {
    return this.data[key];
  },
  setItem(key, value) {
    this.data[key] = value;
    this.length = Object.keys(this.data).length;
  },
  removeItem(key) {
    delete this.data[key];
    this.length = Object.keys(this.data).length;
  },
  clear() {
    this.data = {};
    this.length = 0;
  },
};

/**
 * This class provides an wrapper interface to the a key-value storage.
 * It uses localStorage, sessionStorage or a custom storage if none of the two is available.
 * @export
 * @class Storage
 */
export class Storage {
  /**
   * Creates an instance of Storage.
   * @constructor
   */
  constructor() {
    this.storage = this.initStorage();
  }

  /**
   * Provides a singleton instance of the wrapped storage.
   * @return {Object}
   */
  initStorage() {
    if (storage) {
      return storage;
    }

    try {
      storage =
        typeof window !== 'undefined' && window !== null
          ? window.localStorage || window.sessionStorage
          : null;
    } catch (storageError) {
      storage = null;
    }

    if (!storage || this.isStorageDisabled(storage)) {
      storage = DEFAULT_STORAGE;
      storage.clear();
    }

    return storage;
  }

  /**
   * Check if storage is disabled (like in certain cases with private browsing).
   * In Safari (Mac + iOS) when private browsing is ON, localStorage is read only
   * http://spin.atomicobject.com/2013/01/23/ios-private-browsing-localstorage/
   * @param {Object} testStorage - The storage to check.
   * @return {Boolean}
   */
  isStorageDisabled(testStorage) {
    const testValue = '__VASTStorage__';

    try {
      testStorage.setItem(testValue, testValue);
      if (testStorage.getItem(testValue) !== testValue) {
        testStorage.removeItem(testValue);
        return true;
      }
    } catch (e) {
      return true;
    }

    testStorage.removeItem(testValue);
    return false;
  }

  /**
   * Returns the value for the given key. If the key does not exist, null is returned.
   * @param  {String} key - The key to retrieve the value.
   * @return {any}
   */
  getItem(key) {
    return this.storage.getItem(key);
  }

  /**
   * Adds or updates the value for the given key.
   * @param  {String} key - The key to modify the value.
   * @param  {any} value - The value to be associated with the key.
   * @return {any}
   */
  setItem(key, value) {
    return this.storage.setItem(key, value);
  }

  /**
   * Removes an item for the given key.
   * @param  {String} key - The key to remove the value.
   * @return {any}
   */
  removeItem(key) {
    return this.storage.removeItem(key);
  }

  /**
   * Removes all the items from the storage.
   */
  clear() {
    return this.storage.clear();
  }
}
