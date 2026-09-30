import { useTerminalDimensions } from "@opentui/react";
import type { ReactNode } from "react";
import { useApp } from "../state.tsx";
import { theme, warpPalettes } from "../theme.ts";
import { Footer } from "./footer.tsx";
import "./warp.tsx";

/** Mirrors the website's InfoLayout: a warp-shaded rail on the left, content on the right. */
export function InfoLayout(props: { children: ReactNode }) {
  const { width } = useTerminalDimensions();
  const { motion } = useApp();
  const sidebarWidth = width >= 100 ? Math.min(32, Math.floor(width * 0.2)) : width >= 70 ? 3 : 0;

  return (
    <box flexDirection="column" width="100%" height="100%" backgroundColor={theme.bg}>
      <box flexDirection="row" flexGrow={1} paddingTop={1} gap={3}>
        {sidebarWidth > 0 && (
          <warp
            colors={warpPalettes.sidebar}
            speed={0.15}
            swirl={1.5}
            scale={0.5}
            fps={8}
            animate={motion}
            width={sidebarWidth}
            flexShrink={0}
            marginLeft={sidebarWidth > 3 ? 2 : 0}
          />
        )}
        <box flexDirection="column" flexGrow={1} paddingLeft={sidebarWidth === 0 ? 2 : 0}>
          {props.children}
        </box>
      </box>
      <Footer />
    </box>
  );
}
