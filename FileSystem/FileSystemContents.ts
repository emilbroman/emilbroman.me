import { Directory, Entity, File } from "./Entity";

export interface FileSystemContents {
  listEntities(directory: Directory): Promise<Entity[]>;
  readFile(file: File): Promise<Blob>;
}
