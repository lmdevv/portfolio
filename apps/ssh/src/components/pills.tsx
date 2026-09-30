import { theme } from "../theme.ts";

export function Pills(props: { items: string[] }) {
  return (
    <box flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={0}>
      {props.items.map((item) => (
        <box key={item} backgroundColor={theme.surface} paddingX={1}>
          <text fg={theme.muted}>{item}</text>
        </box>
      ))}
    </box>
  );
}

export function Topics(props: { items: string[] }) {
  if (props.items.length === 0) return null;
  return <text fg={theme.subtle}>{props.items.map((topic) => `#${topic}`).join("  ")}</text>;
}
