import { Command, Environment } from "./Commands/Command";
import { Controller, ArrowEvent } from "./Controller/Controller";
import { Color, Display } from "./Display/Display";
import { FileSystem } from "./FileSystem/FileSystem";

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

    this.#newPrompt();
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
      const ast = parser.parse();
      await ast.execute(
        {
          fileSystem: this.#fileSystem,
          display: this.#display,
          variables: this.#variables,
        },
        this.#commands
      );
    } catch (e) {
      this.#display.write(e instanceof Error ? e.message : String(e));
      this.#display.breakLine();
    }
  }

  start() {
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

namespace ShellScript {
  export class Script {
    constructor(readonly statements: Statement[]) {}

    async execute(env: Environment, commands: Map<string, Command>) {
      for (const statement of this.statements) {
        await statement.execute(env, commands);
      }
    }
  }

  export class Statement {
    constructor(readonly expressions: Expression[]) {}

    async execute(env: Environment, commands: Map<string, Command>) {
      const [commandName, ...args] = this.expressions.flatMap((e) =>
        e.expand()
      );
      const command = commands.get(commandName);
      if (command == null) {
        env.display.write([
          {
            color: Color.Red,
          },
          `command not found: ${commandName}`,
          {
            color: Color.White,
          },
        ]);
        env.display.breakLine();
      } else {
        await command.execute(env, ...args);
      }
    }
  }

  export type Expression = Term;

  export type Term = StringTerm;

  export class StringTerm {
    constructor(readonly string: string) {}

    expand(): string[] {
      return [this.string];
    }
  }
}

class ShellScriptParser {
  #script: string;

  constructor(script: string) {
    this.#script = script;
  }

  parse(): ShellScript.Script {
    const statements: ShellScript.Statement[] = [];
    while (this.#script.length > 0) {
      statements.push(this.#parseStatement());
    }
    return new ShellScript.Script(statements);
  }

  #parseStatement(): ShellScript.Statement {
    const expressions: ShellScript.Expression[] = [];
    expressions: while (true) {
      switch (this.#script[0]) {
        case undefined:
          break expressions;

        case ";":
          this.#script = this.#script.slice(1);
          break expressions;

        case " ":
        case "\t":
          this.#script = this.#script.slice(1);
          break;

        default:
          expressions.push(this.#parseExpression());
          break;
      }
    }
    return new ShellScript.Statement(expressions);
  }

  #parseExpression(): ShellScript.Expression {
    return this.#parseTerm();
  }

  #parseTerm(): ShellScript.Term {
    return this.#parseString();
  }

  #parseString(): ShellScript.StringTerm {
    let quoteContext: '"' | "'" | undefined;

    let sawNothing = true;

    let result = "";
    while (true) {
      if (this.#script.length === 0) {
        break;
      }

      if (quoteContext != null && this.#script[0] === quoteContext) {
        sawNothing = false;
        quoteContext = undefined;
        this.#script = this.#script.slice(1);
        continue;
      }

      if (
        quoteContext == null &&
        (this.#script[0] === "'" || this.#script[0] === '"')
      ) {
        sawNothing = false;
        quoteContext = this.#script[0];
        this.#script = this.#script.slice(1);
        continue;
      }

      if (quoteContext != null || /[\w.,@]/.test(this.#script[0])) {
        sawNothing = false;
        result += this.#script[0];
        this.#script = this.#script.slice(1);
        continue;
      }

      break;
    }

    if (sawNothing) {
      throw new Error("expected term");
    }

    if (quoteContext != null) {
      throw new Error(`expected closing ${quoteContext}`);
    }

    return new ShellScript.StringTerm(result);
  }
}
