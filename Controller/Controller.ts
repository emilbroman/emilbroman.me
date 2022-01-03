import { TypedEventTarget } from "./EventListener";

export interface Controller
  extends TypedEventTarget<InputTextEvent | SubmitEvent | ArrowEvent> {}
export class InputTextEvent extends Event {
  readonly text: string;
  readonly type = "input";

  constructor(text: string) {
    super("input");
    this.text = text;
  }
}
export class SubmitEvent extends Event {
  readonly type = "submit";
  constructor() {
    super("submit");
  }
}
export class ArrowEvent extends Event {
  readonly type = "arrow";
  readonly direction: ArrowEvent.Direction;
  constructor(direction: ArrowEvent.Direction) {
    super("arrow");
    this.direction = direction;
  }
}
export namespace ArrowEvent {
  export enum Direction {
    Up = "ArrowUp",
    Down = "ArrowDown",
    Left = "ArrowLeft",
    Right = "ArrowRight",
  }
}
