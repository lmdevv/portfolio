import type { RichText as RichTextValue } from "@portfolio/content";
import { theme } from "../theme.ts";

export function RichText(props: { value: RichTextValue }) {
  return (
    <text fg={theme.muted}>
      {props.value.map((part, index) =>
        typeof part === "string" ? (
          part
        ) : (
          <strong key={index} fg={theme.strong}>
            {part.strong}
          </strong>
        ),
      )}
    </text>
  );
}
