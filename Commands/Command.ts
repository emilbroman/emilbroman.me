import { Display } from "../Display/Display";
import { FileSystem } from "../FileSystem/FileSystem";

export interface Command {
  readonly name: string;
  init?(env: Environment): void;
  execute(env: Environment, ...args: string[]): Promise<void>;
}

export interface Environment {
  readonly fileSystem: FileSystem;
  readonly display: Display;
  readonly variables: Map<string, string>;
  readonly commands: Map<string, Command>;
}
