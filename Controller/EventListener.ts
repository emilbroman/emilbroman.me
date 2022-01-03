interface EventListener<E extends Event> {
  (evt: E): void;
}

interface EventListenerObject<E extends Event> {
  handleEvent(object: E): void;
}

type EventListenerOrEventListenerObject<E extends Event> =
  | EventListener<E>
  | EventListenerObject<E>;

export interface TypedEventTarget<E extends Event> extends EventTarget {
  addEventListener<T extends E["type"]>(
    type: T,
    callback: EventListenerOrEventListenerObject<
      E extends { type: T } ? E : never
    > | null,
    options?: boolean | AddEventListenerOptions
  ): void;
  dispatchEvent(event: E): boolean;
}
