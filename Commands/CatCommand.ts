import { Command, Environment } from "./Command";

export class CatCommand implements Command {
  readonly name = "cat";

  async execute(env: Environment, ...args: string[]) {
    for (const arg of args) {
      const blob = await env.fileSystem.read({
        url: new URL(arg, env.fileSystem.currentDirectory.url),
        isDirectory: false,
      });

      env.display.write([await blob.text()]);
    }
  }
}
