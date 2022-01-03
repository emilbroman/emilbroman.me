import { Display, Mode, Color, ModeChange, OutputChunk } from "./Display";

export class DOMDisplay implements Display {
  readonly #container: HTMLElement;
  readonly #cursor: HTMLDivElement;
  #currentElement!: HTMLSpanElement;
  #mode: Mode = {
    color: Color.White,
    bold: false,
  };

  constructor(container: HTMLElement) {
    this.#container = container;
    this.#cursor = this.#createCursor();
    this.#enterMode();
  }

  #createCursor(): HTMLDivElement {
    const cursor = document.createElement("div");
    cursor.style.display = "inline";
    cursor.style.position = "relative";

    const content = document.createElement("div");
    content.style.position = "absolute";
    content.style.display = "inline-block";
    content.style.color = Color.White;
    content.style.backgroundColor = Color.White;
    content.style.mixBlendMode = "difference";
    content.style.whiteSpace = "pre";
    content.textContent = " ";

    let blinkToggle = true;
    setInterval(() => {
      blinkToggle = !blinkToggle;
      content.style.opacity = blinkToggle ? "1" : "0";
    }, 500);

    cursor.appendChild(content);
    return cursor;
  }

  #enterMode(modeChange?: ModeChange) {
    if (modeChange) {
      Object.assign(this.#mode, modeChange);
    }
    const element = document.createElement("span");
    element.style.color = this.#mode.color;
    element.style.whiteSpace = "pre-wrap";
    element.style.fontWeight = this.#mode.bold ? "bold" : "normal";

    this.#container.appendChild(element);
    this.#currentElement = element;

    this.#container.appendChild(this.#cursor);
  }

  write(chunks: Iterable<OutputChunk>): void {
    for (const chunk of chunks) {
      if (typeof chunk === "string") {
        if (this.#currentElement.contains(this.#cursor)) {
          this.#currentElement.insertBefore(new Text(chunk), this.#cursor);
        } else {
          this.#currentElement.appendChild(new Text(chunk));
        }
      } else {
        this.#enterMode(chunk);
      }
    }
  }

  breakLine(): void {
    this.#container.appendChild(document.createElement("br"));
    this.#enterMode();
  }

  moveCursor(delta: number): void {
    let index = Array.prototype.indexOf.call(
      this.#currentElement.childNodes,
      this.#cursor
    );
    if (index === -1) {
      index = this.#currentElement.childNodes.length;
    }
    this.#cursor.remove();
    index += delta;
    this.#currentElement.insertBefore(
      this.#cursor,
      this.#currentElement.childNodes.item(index)
    );
  }
}
