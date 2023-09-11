import { isArray, isFunction } from 'epdoc-util';

export function newLocationHistory(options) {
  return new LocationHistory(options);
}

export class LocationHistory {
  history = {};
  warn = null;
  dirty = false;
  getStorage = null;
  setStorage = null;

  constructor(options) {
    this.GATE_HISTORY = 'gate_history';
    this.history = {};
    this.options = options || {};
    this.warn = isFunction(this.options.warn) ? this.options.warn : null;
    this.getStorage = isFunction(this.options.getStorage) ? this.options.getStorage : null;
    this.setStorage = isFunction(this.options.setStorage) ? this.options.setStorage : null;

    this.read();
  }

  read() {
    if (this.getStorage) {
      this.history = this.getStorage(this.GATE_HISTORY) || {};
    }
    return this;
  }

  add(person, location, time) {
    let oldItems = this.history[person];
    if (!isArray(oldItems)) {
      oldItems = [];
    }
    let newItems = [];
    // If an entry already exists at this location, remove it
    for (let idx = 0; idx < oldItems.length; ++idx) {
      const item = oldItems[idx];
      if (item.location !== location) {
        newItems.push(item);
      }
    }
    newItems.push({ location: location, time: time });
    this.history[person] = newItems;
    this.dirty = true;
    return this;
  }

  /**
   * Find the person at any one of the locations, after the time defined by tCutoff
   * @param {} person
   * @param {*} tCutoff date (ms)
   * @param {*} locations Individual or array of location names
   * @returns
   */
  find(person, tCutoff, locations) {
    locations = isArray(locations) ? locations : [locations];
    const items = this.history[person];
    let result = false;
    if (isArray(items)) {
      for (let idx = 0; idx < items.length && !result; ++idx) {
        const item = items[idx];
        this.warn &&
          this.warn(`Entry: (${item.location}, ${new Date(item.time).toLocaleTimeString()})`);
        for (let ldx = 0; ldx < locations.length && !result; ++ldx) {
          const location = locations[ldx];
          this.warn &&
            this.warn(
              `Testing (${item.location}, ${new Date(
                item.time,
              ).toLocaleTimeString()}) against location ${location} cutoff ${new Date(
                tCutoff,
              ).toLocaleTimeString()}.`,
            );
          if (item.location === location && tCutoff < item.time) {
            result = true;
          }
        }
      }
    }
    return result;
  }

  prune(tCutoff) {
    Object.keys(this.history).forEach((key) => {
      const items = this.history[key];
      let newItems = [];
      if (isArray(items)) {
        for (let idx = 0; idx < items.length; ++idx) {
          const item = items[idx];
          if (tCutoff < item.time) {
            newItems.push(item);
          }
        }
      }
      if (!isArray(items) || newItems.length !== items.length) {
        this.history[key] = newItems;
        this.dirty = true;
      }
    });
    return this;
  }

  flush() {
    if (this.dirty) {
      if (this.setStorage) {
        this.setStorage(this.GATE_HISTORY, this.history);
      }
      this.dirty = false;
    }
    return this;
  }

  toString() {
    let result = {};
    Object.keys(this.history).forEach((key) => {
      const items = this.history[key];
      result[key] = [];
      if (isArray(items)) {
        for (let idx = 0; idx < items.length; ++idx) {
          const item = items[idx];
          const newItem = {
            location: item.location,
            time: new Date(item.time).toLocaleTimeString(),
          };
          result[key].push(newItem);
        }
      }
    });
    return JSON.stringify(result);
  }
}
