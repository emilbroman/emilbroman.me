import { Directory } from "./Entity";

export interface FileSystemLocation {
  readonly currentDirectory: Directory;
  changeDirectory(path: string | URL): void;
}
