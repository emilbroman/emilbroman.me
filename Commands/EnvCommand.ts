import { Command, Environment } from "./Command";

export class EnvCommand implements Command {
  readonly name = "env";

  init(env: Environment) {
    env.variables.set("UA", navigator.userAgent);
  }

  async execute(env: Environment, ...args: string[]) {
    for (const [name, value] of env.variables) {
      env.display.write([name, "=", value]);
      env.display.breakLine();
    }
  }
}
