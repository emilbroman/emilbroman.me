import { Command, Environment } from "./Command";

export class EchoCommand implements Command {
  readonly name = "echo";

  async execute(env: Environment, ...args: string[]) {
    env.display.write(args.join(" "));
    env.display.breakLine();
  }
}
