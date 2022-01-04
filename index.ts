import { DOMDisplay } from "./Display/DOMDisplay";
import { FetchFileSystemContents } from "./FileSystem/FetchFileSystemContents";
import { FileSystem } from "./FileSystem/FileSystem";
import { URLTrackedFileSystemLocation } from "./FileSystem/URLTrackedFileSystemLocation";
import { KeyboardController } from "./Controller/KeyboardController";
import { Terminal } from "./Terminal";
import { CatCommand } from "./Commands/CatCommand";
import { ListCommand } from "./Commands/ListCommand";
import { EchoCommand } from "./Commands/EchoCommand";
import { ChangeDirectoryCommand } from "./Commands/ChangeDirectoryCommand";
import { ProcessWorkingDirectoryCommand } from "./Commands/ProcessWorkingDirectoryCommand";
import { CompGenCommand } from "./Commands/CompGenCommand";

export const container = document.createElement("div");
container.style.paddingBottom = "10px";
document.body.prepend(container);

const terminal = new Terminal(
  new FileSystem(
    new URLTrackedFileSystemLocation(),
    new FetchFileSystemContents()
  ),
  new DOMDisplay(container),
  new KeyboardController(),
  [
    new CatCommand(),
    new ListCommand(),
    new EchoCommand(),
    new ChangeDirectoryCommand(),
    new ProcessWorkingDirectoryCommand(),
    new CompGenCommand(),
  ]
);

terminal.start();
