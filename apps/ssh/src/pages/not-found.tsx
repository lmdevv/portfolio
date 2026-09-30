import { Actions, Hero } from "../components/hero.tsx";
import { theme, zinc } from "../theme.ts";

export function NotFoundPage(props: { path: string }) {
  return (
    <Hero
      top={<ascii-font text="404" font="block" color={[zinc[50], zinc[300]]} />}
      bottom={
        <>
          <text fg={theme.muted}>
            <span fg={theme.strong}>{props.path}</span> does not exist.
          </text>
          <Actions
            actions={[
              { label: "Go Home", route: { page: "home" }, primary: true },
              { label: "View Projects", route: { page: "projects" } },
            ]}
          />
        </>
      }
    />
  );
}
