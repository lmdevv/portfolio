import type { KeyEvent } from "@opentui/core";
import { useEffect, useRef, useState } from "react";
import type { ScrollPageHandle } from "./scroll-page.tsx";

/** j/k selection over a list rendered inside a ScrollPage whose items use `${prefix}-${index}` ids. */
export function useListSelection(count: number, prefix: string) {
  const [index, setIndex] = useState(0);
  const scroll = useRef<ScrollPageHandle>(null);

  useEffect(() => {
    scroll.current?.scrollIntoView(`${prefix}-${index}`);
  }, [index, prefix]);

  const onKey = (key: KeyEvent) => {
    if (key.name === "j" || key.name === "down") {
      setIndex((current) => Math.min(count - 1, current + 1));
      return true;
    }
    if (key.name === "k" || key.name === "up") {
      setIndex((current) => Math.max(0, current - 1));
      return true;
    }
    return false;
  };

  return { index: Math.min(index, Math.max(0, count - 1)), setIndex, onKey, scroll };
}
