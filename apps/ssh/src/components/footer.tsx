import { TextAttributes } from "@opentui/core";
import { navItems, sectionOf } from "../router.ts";
import { useApp } from "../state.tsx";
import { theme } from "../theme.ts";

export function Footer() {
  const { route, navigate, toast } = useApp();
  const active = sectionOf(route);

  return (
    <box flexDirection="row" justifyContent="space-between" height={1} paddingX={2} flexShrink={0}>
      <box flexDirection="row" gap={3}>
        {navItems.map((item) => {
          const isActive = item.page === active;
          return (
            <box key={item.page} onMouseDown={() => navigate({ page: item.page })}>
              <text fg={isActive ? theme.strong : theme.subtle} attributes={isActive ? TextAttributes.BOLD : 0}>
                <span fg={theme.faint}>{item.key}</span> {item.page === "home" ? "⌂ /" : item.label}
              </text>
            </box>
          );
        })}
      </box>
      <text fg={toast ? theme.strong : theme.faint}>{toast ?? "? help  q quit"}</text>
    </box>
  );
}
