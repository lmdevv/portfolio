import { TextAttributes } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { navItems, sectionOf } from "../router.ts";
import { useApp } from "../state.tsx";
import { theme } from "../theme.ts";

export function Footer() {
  const { route, navigate, toast } = useApp();
  const { width } = useTerminalDimensions();
  const active = sectionOf(route);
  // Below this width only the active page keeps its label; the rest collapse to their number keys.
  const compact = width < 96;

  return (
    <box flexDirection="row" justifyContent="space-between" height={1} paddingX={2} flexShrink={0}>
      <box flexDirection="row" gap={compact ? 2 : 3}>
        {navItems.map((item) => {
          const isActive = item.page === active;
          const label = item.page === "home" ? "⌂ /" : item.label;
          return (
            <box key={item.page} onMouseDown={() => navigate({ page: item.page })}>
              <text
                fg={isActive ? theme.strong : theme.subtle}
                attributes={isActive ? TextAttributes.BOLD : 0}
              >
                <span fg={isActive && compact ? theme.strong : theme.faint}>{item.key}</span>
                {!compact || isActive ? ` ${label}` : ""}
              </text>
            </box>
          );
        })}
      </box>
      <text fg={toast ? theme.strong : theme.faint}>
        {toast ?? (compact ? "? help" : "? help  q quit")}
      </text>
    </box>
  );
}
