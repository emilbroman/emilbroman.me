import { Color } from "../Display/Display";
import { Command, Environment } from "./Command";

export class ListCommand implements Command {
  readonly name = "ls";

  async execute(env: Environment, ...args: string[]) {
    try {
      const [dir = "."] = args;
      const url = new URL(dir, env.fileSystem.currentDirectory.url);
      if (!url.pathname.endsWith("/")) {
        url.pathname += "/";
      }
      const entries = await env.fileSystem.list({
        url,
        isDirectory: true,
      });
      for (const entry of entries) {
        const segments = entry.url.pathname.split("/");
        const displayName = entry.isDirectory
          ? segments.slice(-1).shift()! + "/"
          : segments.pop()!;
        env.display.write(displayName);
        env.display.breakLine();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      env.display.write([
        {
          color: Color.Red,
        },
        `${this.name}: ${message}`,
        {
          color: Color.White,
        },
        {},
      ]);
      env.display.breakLine();
    }
  }
}
