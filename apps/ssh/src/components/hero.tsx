import { TextAttributes } from "@opentui/core";
import { useEffect, useState, type ReactNode } from "react";
import type { Route } from "../router.ts";
import { useApp, usePageKeys } from "../state.tsx";
import { theme, warpPalettes, zinc } from "../theme.ts";
import "./warp.tsx";

/** Full-screen warp backdrop with content pinned to the top and bottom, like the website's landing. */
export function Hero(props: { top: ReactNode; bottom: ReactNode }) {
  const { motion } = useApp();

  return (
    <box width="100%" height="100%" backgroundColor={zinc[950]}>
      <warp
        colors={warpPalettes.hero}
        speed={0.6}
        swirl={0.5}
        scale={0.3}
        animate={motion}
        position="absolute"
        left={0}
        top={0}
        width="100%"
        height="100%"
      />
      <box
        position="absolute"
        left={0}
        top={0}
        width="100%"
        height="100%"
        flexDirection="column"
        justifyContent="space-between"
        paddingX={3}
        paddingY={1}
      >
        <box flexDirection="column">{props.top}</box>
        <box flexDirection="column" gap={1}>
          {props.bottom}
        </box>
      </box>
    </box>
  );
}

export type Action = { label: string; route: Route; primary?: boolean };

/** A row of pill buttons, moved through with ←/→ (or h/l) and activated with enter or a click. */
export function Actions(props: { actions: Action[]; hint?: string }) {
  const { navigate } = useApp();
  const [focus, setFocus] = useState(0);
  const count = props.actions.length;

  usePageKeys((key) => {
    if (key.name === "left" || key.name === "h") setFocus((index) => (index - 1 + count) % count);
    else if (key.name === "right" || key.name === "l") setFocus((index) => (index + 1) % count);
    else if (key.name === "return" || key.name === "enter") {
      const action = props.actions[focus];
      if (action) navigate(action.route);
    }
  });

  return (
    <box flexDirection="row" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" rowGap={1}>
      <box flexDirection="row" flexWrap="wrap" gap={1}>
        {props.actions.map((action, index) => {
          const focused = index === focus;
          const bg = action.primary ? (focused ? zinc[50] : zinc[300]) : focused ? zinc[700] : undefined;
          const fg = action.primary ? zinc[950] : focused ? zinc[50] : zinc[200];
          return (
            <box
              key={action.label}
              backgroundColor={bg}
              paddingX={2}
              onMouseDown={() => navigate(action.route)}
              onMouseOver={() => setFocus(index)}
            >
              <text fg={fg} attributes={focused ? TextAttributes.BOLD : 0}>
                {action.label}
              </text>
            </box>
          );
        })}
      </box>
      {props.hint && <text fg={zinc[500]}>{props.hint}</text>}
    </box>
  );
}

export function AvailableForWork() {
  const { motion } = useApp();
  const [lit, setLit] = useState(true);

  useEffect(() => {
    if (!motion) return setLit(true);
    const timer = setInterval(() => setLit((on) => !on), 800);
    return () => clearInterval(timer);
  }, [motion]);

  return (
    <text fg={theme.text}>
      <span fg={lit ? zinc[100] : zinc[600]}>●</span> Available For Work
    </text>
  );
}
