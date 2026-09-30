import { RGBA, SyntaxStyle } from "@opentui/core";

/** Tailwind zinc, the same palette the website uses. */
export const zinc = {
  50: "#fafafa",
  100: "#f4f4f5",
  200: "#e4e4e7",
  300: "#d4d4d8",
  400: "#a1a1aa",
  500: "#71717a",
  600: "#52525b",
  700: "#3f3f46",
  800: "#27272a",
  900: "#18181b",
  950: "#09090b",
} as const;

export const theme = {
  bg: zinc[900],
  surface: zinc[800],
  border: zinc[800],
  borderActive: zinc[500],
  text: zinc[300],
  muted: zinc[400],
  subtle: zinc[500],
  faint: zinc[600],
  strong: zinc[100],
  bright: zinc[50],
  titleGradient: [zinc[50], zinc[400]],
} as const;

/** Warp palettes lifted from the website's shader backgrounds. */
export const warpPalettes = {
  hero: [zinc[950], zinc[800], zinc[600]],
  sidebar: [zinc[50], zinc[800], zinc[600]],
} as const;

const hex = (value: string) => RGBA.fromHex(value);

export const markdownStyle = SyntaxStyle.fromStyles({
  default: { fg: hex(zinc[300]) },
  conceal: { fg: hex(zinc[600]) },
  "markup.heading": { fg: hex(zinc[50]), bold: true },
  "markup.heading.1": { fg: hex(zinc[50]), bold: true, underline: true },
  "markup.heading.2": { fg: hex(zinc[100]), bold: true },
  "markup.heading.3": { fg: hex(zinc[100]), bold: true },
  "markup.strong": { fg: hex(zinc[200]), bold: true },
  "markup.italic": { fg: hex(zinc[300]), italic: true },
  "markup.strikethrough": { fg: hex(zinc[500]), dim: true },
  "markup.quote": { fg: hex(zinc[200]), italic: true },
  "markup.list": { fg: hex(zinc[500]) },
  "markup.raw": { fg: hex(zinc[200]), bg: hex(zinc[800]) },
  "markup.raw.block": { fg: hex(zinc[200]) },
  "markup.link": { fg: hex(zinc[300]), underline: true },
  "markup.link.label": { fg: hex(zinc[200]), underline: true },
  "markup.link.url": { fg: hex(zinc[500]) },
  label: { fg: hex(zinc[400]) },
  keyword: { fg: hex(zinc[100]), bold: true },
  string: { fg: hex(zinc[400]) },
  comment: { fg: hex(zinc[500]), italic: true },
  number: { fg: hex(zinc[200]) },
  function: { fg: hex(zinc[100]) },
  type: { fg: hex(zinc[200]), italic: true },
  punctuation: { fg: hex(zinc[500]) },
});
