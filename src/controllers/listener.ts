export type Listener<T> = (event: T) => void;

type EventListeners<EM extends Record<string, unknown>> = {
  [K in keyof EM]?: Set<Listener<EM[K]>>;
};

export interface IListenable<EventMap extends Record<string, unknown>> {
  addListener<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): this;

  removeListener<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ): this;
}

/**
 * Is there an existing Browser API for this?
 */
export abstract class Listenable<EventMap extends Record<string, unknown>>
  implements IListenable<EventMap>
{
  private readonly listeners: EventListeners<EventMap> = {};

  addListener<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ) {
    this.listeners[event] ||= new Set();
    this.listeners[event].add(listener);

    return this;
  }

  removeListener<K extends keyof EventMap>(
    event: K,
    listener: Listener<EventMap[K]>,
  ) {
    this.listeners[event] ||= new Set();
    this.listeners[event].delete(listener);

    return this;
  }

  protected emit<K extends keyof EventMap>(event: K, value: EventMap[K]) {
    const listeners = this.listeners[event];
    if (!listeners) {
      return;
    }

    for (const l of listeners) {
      l(value);
    }
  }
}
