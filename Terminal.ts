import { Command } from "./Commands/Command";
import { Controller, ArrowEvent } from "./Controller/Controller";
import { Color, Display } from "./Display/Display";
import { FileSystem } from "./FileSystem/FileSystem";
import { ShellScriptParser } from "./ShellScript/ShellScriptParser";

export class Terminal {
  readonly #fileSystem: FileSystem;
  readonly #display: Display;
  readonly #controller: Controller;
  readonly #commands = new Map<string, Command>();
  readonly #variables = new Map<string, string>();

  constructor(
    fileSystem: FileSystem,
    display: Display,
    controller: Controller,
    commands: Iterable<Command>
  ) {
    this.#fileSystem = fileSystem;
    this.#display = display;
    this.#controller = controller;

    for (const command of commands) {
      this.#commands.set(command.name, command);
    }
  }

  #prompt!: string;
  #index!: number;

  #newPrompt() {
    this.#prompt = "";
    this.#index = 0;
    this.#display.write([
      { color: Color.Blue },
      this.#fileSystem.currentDirectory.url.pathname,
      { color: Color.Gray },
      " $ ",
      { color: Color.White },
    ]);
  }

  async #execute(script: string) {
    try {
      const parser = new ShellScriptParser(script);
      var ast = parser.parse();
      await ast.execute(
        {
          fileSystem: this.#fileSystem,
          display: this.#display,
          variables: this.#variables,
          commands: this.#commands,
        },
        this.#commands
      );
    } catch (e) {
      this.#display.write([
        { color: Color.Red },
        e instanceof Error ? e.message : String(e),
        { color: Color.White },
      ]);
      this.#display.breakLine();
    }
  }

  start() {
    const start = new Date("2014-09-01");
    const now = new Date();
    let yearsOfExperience = now.getUTCFullYear() - start.getUTCFullYear();

    const monthsDiff = now.getUTCMonth() - start.getUTCMonth();
    const daysDiff = now.getUTCDate() - start.getUTCDate();

    if (monthsDiff < 0 || (monthsDiff === 0 && daysDiff <= 0)) {
      yearsOfExperience--;
    }

    this.#display.write([
      { color: Color.White, bold: true },
      // prettier-ignore
      "╔═╗┌┬┐┬┬    ╔╗ ┬─┐┌─┐┌┬┐┌─┐┌┐┌\n" +
      "║╣ │││││    ╠╩╗├┬┘│ ││││├─┤│││\n" +
      "╚═╝┴ ┴┴┴─┘  ╚═╝┴└─└─┘┴ ┴┴ ┴┘└┘\n\n",

      { color: Color.Gray, bold: false },
      "I'm a Software Engineer, currently self-employed as a consultant. ",
      "I have more than ",
      { color: Color.White, bold: true },
      `${yearsOfExperience} years of experience`,
      { color: Color.Gray, bold: false },
      ", working mostly as a UI Engineer, ",
      "but with a burning passion for all kinds of programming.\n\n",

      "As you might be able to tell, this website takes the form of a terminal. ",
      "If you know your stuff, you'll be able to learn more about me! :)\n\n",

      { color: Color.White, bold: true },
      "Good Luck!\n\n",
      { bold: false },
    ]);

    this.#newPrompt();

    this.#controller.addEventListener("input", (event) => {
      this.#prompt =
        this.#prompt.slice(0, this.#index) +
        event.text +
        this.#prompt.slice(this.#index);
      this.#index += event.text.length;
      this.#display.write(event.text);
    });
    this.#controller.addEventListener("submit", async () => {
      this.#display.breakLine();
      await this.#execute(this.#prompt);
      this.#newPrompt();
    });
    this.#controller.addEventListener("backspace", (event) => {
      if (this.#index === 0) {
        return;
      }

      this.#prompt =
        this.#prompt.slice(0, this.#index - 1) +
        this.#prompt.slice(this.#index);

      this.#index -= 1;
      this.#display.delete();
    });
    this.#controller.addEventListener("arrow", (event) => {
      switch (event.direction) {
        case ArrowEvent.Direction.Left: {
          const newIndex = Math.max(0, this.#index - 1);
          this.#display.moveCursor(newIndex - this.#index);
          this.#index = newIndex;
          break;
        }
        case ArrowEvent.Direction.Right: {
          const newIndex = Math.min(this.#prompt.length, this.#index + 1);
          this.#display.moveCursor(newIndex - this.#index);
          this.#index = newIndex;
          break;
        }
        case ArrowEvent.Direction.Up:
          break;
        case ArrowEvent.Direction.Down:
          break;
      }
    });
  }
}
