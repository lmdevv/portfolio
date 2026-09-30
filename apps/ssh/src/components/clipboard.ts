import { useRenderer } from "@opentui/react";
import { useCallback } from "react";
import { useApp } from "../state.tsx";

/** Copies through OSC 52, which reaches the viewer's clipboard even across SSH. */
export function useCopy() {
  const renderer = useRenderer();
  const { flash } = useApp();

  return useCallback(
    (text: string) => {
      const ok = renderer.copyToClipboardOSC52(text);
      flash(ok ? `Copied ${text}` : `Clipboard unavailable: ${text}`);
    },
    [renderer, flash],
  );
}

export function displayUrl(url: string) {
  return url
    .replace(/^mailto:/, "")
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "");
}
