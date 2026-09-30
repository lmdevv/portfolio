import type { KeyEvent, ScrollBoxRenderable } from "@opentui/core";
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import { usePageKeys } from "../state.tsx";
import { theme } from "../theme.ts";

export type ScrollPageHandle = {
  scrollIntoView: (id: string) => void;
};

/**
 * Vertical scroll container driven by vim-ish keys. Pages that own j/k for selection pass
 * `lineKeys={false}` and call `scrollIntoView` themselves.
 */
export const ScrollPage = forwardRef<
  ScrollPageHandle,
  { children: ReactNode; lineKeys?: boolean; onKey?: (key: KeyEvent) => void }
>(function ScrollPage({ children, lineKeys = true, onKey }, ref) {
  const scroll = useRef<ScrollBoxRenderable>(null);

  useImperativeHandle(ref, () => ({
    scrollIntoView: (id) => scroll.current?.scrollChildIntoView(id),
  }));

  usePageKeys((key) => {
    const box = scroll.current;
    if (!box) return;
    const page = Math.max(1, Math.floor(box.viewport.height / 2));

    if (lineKeys && (key.name === "j" || key.name === "down")) box.scrollBy(1);
    else if (lineKeys && (key.name === "k" || key.name === "up")) box.scrollBy(-1);
    else if (key.name === "pagedown" || key.name === "space" || (key.ctrl && key.name === "d"))
      box.scrollBy(page);
    else if (key.name === "pageup" || (key.ctrl && key.name === "u")) box.scrollBy(-page);
    else if (key.name === "home" || (key.name === "g" && !key.shift)) box.scrollTo(0);
    else if (key.name === "end" || (key.name === "g" && key.shift)) box.scrollTo(box.scrollHeight);
    else onKey?.(key);
  });

  return (
    <scrollbox
      ref={scroll}
      flexGrow={1}
      scrollbarOptions={{
        trackOptions: { foregroundColor: theme.faint, backgroundColor: theme.bg },
      }}
      contentOptions={{ flexDirection: "column", paddingRight: 2, paddingBottom: 1 }}
    >
      {children}
    </scrollbox>
  );
});
