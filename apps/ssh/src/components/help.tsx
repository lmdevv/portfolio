import { TextAttributes } from "@opentui/core";
import { useApp } from "../state.tsx";
import { theme } from "../theme.ts";

const sections: Array<{ title: string; keys: Array<[string, string]> }> = [
  {
    title: "Navigate",
    keys: [
      ["1-6", "jump to a page"],
      ["tab / shift+tab", "next / previous page"],
      ["esc / backspace", "go back"],
      ["enter", "open selection"],
    ],
  },
  {
    title: "Move",
    keys: [
      ["j k / ↑ ↓", "scroll or select"],
      ["h l / ← →", "switch buttons or categories"],
      ["space / pgdn", "page down"],
      ["g / G", "top / bottom"],
    ],
  },
  {
    title: "Extras",
    keys: [
      ["y", "copy link (OSC 52)"],
      ["i", "cycle images: auto, blocks, ascii, alt"],
      ["m", "toggle motion"],
      ["q / ctrl+c", "quit"],
    ],
  },
];

export function HelpOverlay() {
  const { imageMode, motion } = useApp();

  return (
    <box position="absolute" top={0} left={0} width="100%" height="100%" justifyContent="center" alignItems="center">
      <box
        border
        borderStyle="rounded"
        borderColor={theme.borderActive}
        backgroundColor={theme.bg}
        title=" keys "
        titleAlignment="center"
        paddingX={3}
        paddingY={1}
        flexDirection="column"
        gap={1}
        width={66}
      >
        {sections.map((section) => (
          <box key={section.title} flexDirection="column">
            <text fg={theme.strong} attributes={TextAttributes.BOLD}>
              {section.title}
            </text>
            {section.keys.map(([key, description]) => (
              <text key={key} fg={theme.muted}>
                <span fg={theme.bright}>{key.padEnd(18)}</span>
                {description}
              </text>
            ))}
          </box>
        ))}
        <text fg={theme.subtle}>
          images: {imageMode} · motion: {motion ? "on" : "off"} · esc to close
        </text>
      </box>
    </box>
  );
}
