import { useTerminalDimensions } from "@opentui/react";
import { profile } from "@portfolio/content";
import { Actions, AvailableForWork, Hero } from "../components/hero.tsx";
import { theme, zinc } from "../theme.ts";

const nameGradient = [zinc[50], zinc[300]];

export function HomePage() {
  const { width, height } = useTerminalDimensions();
  // "block" needs ~55 columns for AGREDA and 18 rows for three lines plus the bottom bar.
  const font = width >= 64 && height >= 30 ? "block" : "tiny";

  return (
    <Hero
      top={
        <>
          {[profile.firstName, profile.middleName, profile.lastName].map((word) => (
            <ascii-font key={word} text={word} font={font} color={nameGradient} />
          ))}
          <text fg={theme.muted} marginTop={1}>
            {profile.role} · {profile.location.city}
          </text>
        </>
      }
      bottom={
        <>
          {profile.availableForWork && <AvailableForWork />}
          <Actions
            hint="←→ choose · enter · m motion · ? help"
            actions={[
              { label: "Let's Connect", route: { page: "contact" }, primary: true },
              { label: "View Projects", route: { page: "projects" } },
              { label: "Experience", route: { page: "experience" } },
              { label: "Blog", route: { page: "blog" } },
              { label: "About", route: { page: "about" } },
            ]}
          />
        </>
      }
    />
  );
}
