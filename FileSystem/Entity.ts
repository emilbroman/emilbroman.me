export interface File {
  url: URL;
  isDirectory: false;
}

export interface Directory {
  url: URL;
  isDirectory: true;
}
export type Entity = File | Directory;
