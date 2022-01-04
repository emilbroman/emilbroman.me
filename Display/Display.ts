export interface Display {
  write(chunks: Iterable<OutputChunk>): void;
  breakLine(): void;
  moveCursor(delta: number): void;
  delete(): void;
}
export type OutputChunk = ModeChange | string;
export type ModeChange = Partial<Mode>;
export enum Color {
  Black = "#000000",
  Blue = "#4444CC",
  Gray = "#AAAAAA",
  White = "#FFFFFF",
  Red = "#FF4444",
}
export interface Mode {
  color: Color;
  bold: boolean;
}
