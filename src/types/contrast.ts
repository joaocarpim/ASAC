// src/types/contrast.ts

export type ContrastMode =
  | "blue_yellow"
  | "black_white"
  | "white_black"
  | "sepia"
  | "grayscale"
  | "cyan_dark";

export interface Theme {
  background: string;
  text: string;
  card: string;
  cardText: string;
  button: string;
  buttonText: string;
  statusBarStyle: "dark-content" | "light-content";
}

export interface ContrastContextData {
  contrastMode: ContrastMode;
  theme: Theme;
  changeContrastMode: (mode: ContrastMode) => void;
}
