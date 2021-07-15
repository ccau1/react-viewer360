export interface EventFunction<Data = any> {
  (data: Data): void;
}

export default class Events {
  protected _events: { [eventName: string]: EventFunction[] } = {};

  constructor() {}

  addListener<Data = any>(eventName: string, fn: EventFunction<Data>) {
    // if not already exists, create a new field for it
    if (!this._events[eventName]) this._events[eventName] = [];
    // add function to event
    this._events[eventName].push(fn);
  }

  removeListener(eventName: string, fn: EventFunction) {
    // if event name doesn't have any functions, nothing to delete
    if (!this._events[eventName]?.length) return;
    // go through all items from last to first
    for (let i = this._events[eventName].length - 1; i >= 0; i--) {
      // if event function matches, remove it
      if (this._events[eventName][i] === fn)
        this._events[eventName].splice(i, 1);
    }
  }

  dispatch(eventName: string, data: any) {
    // go through each function and send event
    for (const eventFn of this._events[eventName] || []) {
      eventFn(data);
    }
  }
}
