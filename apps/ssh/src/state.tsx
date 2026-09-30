import type { KeyEvent } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Route } from "./router.ts";

/**
 * - auto: Kitty or Sixel graphics when the terminal supports them, quadrant blocks otherwise.
 * - blocks: always Unicode quadrant blocks.
 * - ascii: character-ramp art, readable on any terminal.
 * - alt: no pixels, just the alt text.
 */
export type ImageMode = "auto" | "blocks" | "ascii" | "alt";
export const imageModes: ImageMode[] = ["auto", "blocks", "ascii", "alt"];

export type Options = {
  imageMode: ImageMode;
  motion: boolean;
};

type AppState = Options & {
  route: Route;
  navigate: (route: Route) => void;
  back: () => void;
  canGoBack: boolean;
  cycleImageMode: () => void;
  toggleMotion: () => void;
  toast: string | undefined;
  flash: (message: string) => void;
  helpOpen: boolean;
  setHelpOpen: (open: boolean | ((open: boolean) => boolean)) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider(props: { initialRoute: Route; options: Options; children: ReactNode }) {
  const [history, setHistory] = useState<Route[]>([props.initialRoute]);
  const [imageMode, setImageMode] = useState(props.options.imageMode);
  const [motion, setMotion] = useState(props.options.motion);
  const [toast, setToast] = useState<string>();
  const [helpOpen, setHelpOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const flash = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(undefined), 2500);
  }, []);

  const navigate = useCallback((route: Route) => {
    setHistory((stack) => {
      const current = stack[stack.length - 1];
      if (current && JSON.stringify(current) === JSON.stringify(route)) return stack;
      return [...stack, route];
    });
  }, []);

  const back = useCallback(() => {
    setHistory((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
  }, []);

  const cycleImageMode = useCallback(() => {
    setImageMode((mode) => {
      const next = imageModes[(imageModes.indexOf(mode) + 1) % imageModes.length] ?? "auto";
      flash(`Images: ${next}`);
      return next;
    });
  }, [flash]);

  const toggleMotion = useCallback(() => {
    setMotion((on) => {
      flash(on ? "Motion off" : "Motion on");
      return !on;
    });
  }, [flash]);

  const value = useMemo<AppState>(
    () => ({
      route: history[history.length - 1] ?? { page: "home" },
      navigate,
      back,
      canGoBack: history.length > 1,
      imageMode,
      cycleImageMode,
      motion,
      toggleMotion,
      toast,
      flash,
      helpOpen,
      setHelpOpen,
    }),
    [
      history,
      navigate,
      back,
      imageMode,
      cycleImageMode,
      motion,
      toggleMotion,
      toast,
      flash,
      helpOpen,
    ],
  );

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
}

export function useApp() {
  const state = useContext(AppContext);
  if (!state) throw new Error("useApp must be used inside <AppProvider>");
  return state;
}

/** Page-level key handler that stays quiet while an overlay owns the keyboard. */
export function usePageKeys(handler: (key: KeyEvent) => void) {
  const { helpOpen } = useApp();
  const latest = useRef(handler);
  latest.current = handler;

  useKeyboard((key) => {
    if (!helpOpen) latest.current(key);
  });
}
