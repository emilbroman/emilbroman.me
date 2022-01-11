import { Command, Environment } from "./Command";

export class ChangeDirectoryCommand implements Command {
  readonly name = "cd";

  init(env: Environment) {
    this.#updateEnv(env);
  }

  #updateEnv(env: Environment) {
    env.variables.set("PWD", env.fileSystem.currentDirectory.url.pathname);
  }

  async execute(env: Environment, ...args: string[]) {
    for (const arg of args) {
      env.fileSystem.changeDirectory(arg);
      this.#updateEnv(env);
    }
  }
}
