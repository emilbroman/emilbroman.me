import { Directory } from "./Entity";
import { FileSystemLocation } from "./FileSystemLocation";

export class URLTrackedFileSystemLocation implements FileSystemLocation {
  get currentDirectory(): Directory {
    return {
      url: new URL(location.href),
      isDirectory: true,
    };
  }

  changeDirectory(path: string | URL) {
    const url = new URL(path, location.href);
    if (!url.pathname.endsWith("/")) {
      url.pathname += "/";
    }
    history.pushState(null, "", url);
  }
}
