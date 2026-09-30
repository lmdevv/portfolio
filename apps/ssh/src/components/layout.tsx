import { useTerminalDimensions } from "@opentui/react";
import type { ReactNode } from "react";
import { useApp } from "../state.tsx";
import { theme, warpPalettes } from "../theme.ts";
import { Footer } from "./footer.tsx";
import "./warp.tsx";

function metrics(width: number) {
  const sidebar = width >= 100 ? Math.min(32, Math.floor(width * 0.2)) : width >= 70 ? 3 : 0;
  const sidebarMargin = sidebar > 3 ? 2 : 0;
  const gap = sidebar > 0 ? 3 : 2;
  // Trailing 3 columns: scrollbar plus the scroll content's right padding.
  const content = Math.max(20, width - sidebar - sidebarMargin - gap - 3);
  return { sidebar, sidebarMargin, content };
}

/** Columns available to page content inside InfoLayout, after the rail, gaps, and scrollbar. */
export function useContentWidth() {
  return metrics(useTerminalDimensions().width).content;
}

/** Mirrors the website's InfoLayout: a warp-shaded rail on the left, content on the right. */
export function InfoLayout(props: { children: ReactNode }) {
  const { width } = useTerminalDimensions();
  const { motion } = useApp();
  const { sidebar, sidebarMargin } = metrics(width);

  return (
    <box flexDirection="column" width="100%" height="100%" backgroundColor={theme.bg}>
      <box flexDirection="row" flexGrow={1} paddingTop={1} gap={3}>
        {sidebar > 0 && (
          <warp
            colors={warpPalettes.sidebar}
            speed={0.08}
            swirl={1.5}
            scale={0.5}
            fps={4}
            levels={10}
            animate={motion}
            width={sidebar}
            flexShrink={0}
            marginLeft={sidebarMargin}
          />
        )}
        <box flexDirection="column" flexGrow={1} paddingLeft={sidebar === 0 ? 2 : 0}>
          {props.children}
        </box>
      </box>
      <Footer />
    </box>
  );
}
