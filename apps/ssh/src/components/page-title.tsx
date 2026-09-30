import { useTerminalDimensions } from "@opentui/react";
import { TextAttributes } from "@opentui/core";
import { theme } from "../theme.ts";

export function PageTitle(props: { title: string; subtitle?: string }) {
  const { width } = useTerminalDimensions();
  // The tiny font is ~4 columns per glyph; below that, plain bold text reads better than clipped art.
  const fits = props.title.length * 4 + 30 < width;

  return (
    <box flexDirection="column" marginBottom={1} flexShrink={0}>
      {fits ? (
        <ascii-font text={props.title} font="tiny" color={[...theme.titleGradient]} />
      ) : (
        <text fg={theme.bright} attributes={TextAttributes.BOLD}>
          {props.title}
        </text>
      )}
      {props.subtitle && <text fg={theme.subtle}>{props.subtitle}</text>}
    </box>
  );
}
