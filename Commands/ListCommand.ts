import { Command, Environment } from "./Command";

export class ListCommand implements Command {
  readonly name = "ls";

  async execute(env: Environment, ...args: string[]) {
    const entries = await env.fileSystem.list();
    for (const entry of entries) {
      const segments = entry.url.pathname.split("/");
      const displayName = entry.isDirectory
        ? segments.slice(-1).shift()! + "/"
        : segments.pop()!;
      env.display.write(displayName);
      env.display.breakLine();
    }
  }
}
