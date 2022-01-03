import { Command, Environment } from "./Command";

export class ChangeDirectoryCommand implements Command {
  readonly name = "cd";

  async execute(env: Environment, ...args: string[]) {
    for (const arg of args) {
      env.fileSystem.changeDirectory(arg);
    }
  }
}
