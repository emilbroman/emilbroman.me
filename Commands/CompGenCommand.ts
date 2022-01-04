import { Color } from "../Display/Display";
import { Command, Environment } from "./Command";

export class CompGenCommand implements Command {
  readonly name = "compgen";

  async execute(env: Environment, ...args: string[]) {
    for (const arg of args) {
      if (arg.startsWith("-")) {
        for (const option of arg.slice(1)) {
          this.#handle(env, option);
        }
      } else {
        this.#error(env, "Unexpected argument. Use `compgen -c`");
      }
    }
  }

  #error(env: Environment, message: string) {
    env.display.write([
      { color: Color.Red },
      message,
      "\n",
      { color: Color.White },
    ]);
  }

  #handle(env: Environment, option: string) {
    switch (option) {
      case "c":
        Array.from(env.commands.values(), (c) => c.name)
          .sort()
          .forEach((cmd) => env.display.write([cmd, "\n"]));
        break;
      default:
        this.#error(env, `Unknown option "${option}". Use \`compgen -c\``);
        break;
    }
  }
}
