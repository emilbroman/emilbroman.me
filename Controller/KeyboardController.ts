import {
  Controller,
  SubmitEvent,
  ArrowEvent,
  InputTextEvent,
} from "./Controller";

export class KeyboardController extends EventTarget implements Controller {
  addEventListener(
    type: string,
    callback: globalThis.EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (type === "input") {
      window.addEventListener("keydown", this.#onKeyDown, options);
    }
    return super.addEventListener(type, callback, options);
  }

  removeEventListener(
    type: string,
    callback: globalThis.EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions
  ): void {
    if (type === "input") {
      window.removeEventListener("keydown", this.#onKeyDown, options);
    }
    return super.removeEventListener(type, callback, options);
  }

  #onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Meta":
      case "Alt":
      case "Control":
      case "Shift":
        break;
      case "Enter":
        event.preventDefault();
        this.dispatchEvent(new SubmitEvent());
        break;
      case ArrowEvent.Direction.Up:
      case ArrowEvent.Direction.Down:
      case ArrowEvent.Direction.Left:
      case ArrowEvent.Direction.Right:
        event.preventDefault();
        this.dispatchEvent(new ArrowEvent(event.key));
        break;
      default:
        if (event.key.length === 1) {
          if (event.metaKey || event.ctrlKey || event.altKey) {
            this.#handleKeyboardShortcut(event);
            break;
          }

          event.preventDefault();
          this.dispatchEvent(new InputTextEvent(event.key));
        }
        break;
    }
  };

  async #handleKeyboardShortcut(event: KeyboardEvent) {
    let legend = "";
    if (event.metaKey) {
      legend = "<M>";
    }
    if (event.altKey) {
      legend = "<A>";
    }
    if (event.ctrlKey) {
      legend = "<C>";
    }
    if (event.shiftKey) {
      legend = "<S>";
    }
    legend += event.key.toUpperCase();

    switch (legend) {
      case "<M>V":
        const text = await navigator.clipboard.readText();
        this.dispatchEvent(new InputTextEvent(text));
        break;
      default:
        break;
    }
  }
}
