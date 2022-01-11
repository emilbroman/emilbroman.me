import { Color } from "../Display/Display";
import { Command, Environment } from "./Command";

export class SetCommand implements Command {
  readonly name = "set";

  async execute(env: Environment, ...args: string[]) {
    if (args.length === 0) {
      env.display.write([
        { color: Color.Red },
        "set: usage: set VAR1=value VAR2=value ...",
        { color: Color.White },
      ]);
      env.display.breakLine();
      return;
    }

    for (const arg of args) {
      const [name, value = ""] = arg.split(/=/);
      env.variables.set(name, value);
    }
  }
}
