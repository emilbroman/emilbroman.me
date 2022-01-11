import { Directory, Entity, File } from "./Entity";
import { FileSystemContents } from "./FileSystemContents";

export class FetchFileSystemContents implements FileSystemContents {
  async listEntities(directory: Directory): Promise<Entity[]> {
    const url = new URL("./index.json", directory.url);

    const response = await fetch(url.href);

    if (response.status === 404) {
      throw new Error("no such file or directory");
    }

    const contents: { url: string; isDirectory: boolean }[] =
      await response.json();

    return contents.map((entry) => ({
      url: new URL(entry.url, directory.url),
      isDirectory: entry.isDirectory,
    }));
  }

  async readFile(file: File): Promise<Blob> {
    const response = await fetch(file.url.href);

    if (response.status === 404) {
      throw new Error(`File not found: ${file.url.pathname}`);
    }

    return response.blob();
  }
}
