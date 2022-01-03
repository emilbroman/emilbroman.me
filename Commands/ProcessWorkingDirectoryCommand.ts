import { Command, Environment } from "./Command";

export class ProcessWorkingDirectoryCommand implements Command {
  readonly name = "pwd";

  async execute(env: Environment, ...args: string[]) {
    env.display.write(
      env.fileSystem.currentDirectory.url.pathname.replace(/\/+$/, "") || "/"
    );
    env.display.breakLine();
  }
}
