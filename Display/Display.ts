export interface Display {
  write(chunks: Iterable<OutputChunk>): void;
  breakLine(): void;
  moveCursor(delta: number): void;
}
export type OutputChunk = ModeChange | string;
export type ModeChange = Partial<Mode>;
export enum Color {
  Black = "#000000",
  White = "#FFFFFF",
}
export interface Mode {
  color: Color;
  bold: boolean;
}
