import { Color } from "../Display/Display";
import { Command, Environment } from "./Command";

export class OpenCommand implements Command {
  readonly name = "open";

  async execute(env: Environment, ...args: string[]) {
    if (args.length === 0) {
      env.display.write([
        { color: Color.Red },
        "open: usage: open file1.url ...",
        { color: Color.White },
      ]);
      env.display.breakLine();
      return;
    }

    for (const arg of args) {
      const match = arg.match(/\.([a-z]+)$/);
      if (match == null) {
        env.display.write([
          { color: Color.Red },
          `open: cannot open extensionless file ${arg}`,
          { color: Color.White },
        ]);
        env.display.breakLine();
        continue;
      }
      const [, extension] = match;

      switch (extension) {
        case "url": {
          const blob = await env.fileSystem.read({
            url: new URL(arg, env.fileSystem.currentDirectory.url),
            isDirectory: false,
          });
          const url = (await blob.text()).trim();
          window.open(url);
          break;
        }

        case "txt":
        case "md":
        case "pdf":
          window.open(new URL(arg, env.fileSystem.currentDirectory.url));
          break;

        default:
          env.display.write([
            { color: Color.Red },
            `open: cannot open ${extension} files`,
            { color: Color.White },
          ]);
          env.display.breakLine();
          break;
      }
    }
  }
}
