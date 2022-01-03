import { Directory, Entity, File } from "./Entity";
import { FileSystemContents } from "./FileSystemContents";
import { FileSystemLocation } from "./FileSystemLocation";

export class FileSystem {
  readonly #location: FileSystemLocation;
  readonly #contents: FileSystemContents;

  constructor(location: FileSystemLocation, contents: FileSystemContents) {
    this.#location = location;
    this.#contents = contents;
  }

  get currentDirectory(): Directory {
    return this.#location.currentDirectory;
  }

  list(directory?: Directory): Promise<Entity[]> {
    return this.#contents.listEntities(directory ?? this.currentDirectory);
  }

  read(file: File): Promise<Blob> {
    return this.#contents.readFile(file);
  }

  changeDirectory(path: string | URL) {
    return this.#location.changeDirectory(path);
  }
}
