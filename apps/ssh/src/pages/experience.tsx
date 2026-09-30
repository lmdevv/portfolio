import { TextAttributes } from "@opentui/core";
import { experiences } from "@portfolio/content";
import { InfoLayout, useContentWidth } from "../components/layout.tsx";
import { PageTitle } from "../components/page-title.tsx";
import { Pills } from "../components/pills.tsx";
import { ScrollPage } from "../components/scroll-page.tsx";
import { theme } from "../theme.ts";

export function ExperiencePage() {
  const wide = useContentWidth() >= 80;

  return (
    <InfoLayout>
      <PageTitle title="Experience" />
      <ScrollPage>
        {experiences.map((experience, index) => (
          <box
            key={`${experience.company}-${experience.period}`}
            border={["left"]}
            borderColor={index === 0 ? theme.muted : theme.faint}
            paddingLeft={2}
            marginBottom={2}
            flexDirection="column"
          >
            <box flexDirection={wide ? "row" : "column"} justifyContent="space-between">
              <box flexDirection="column">
                <text fg={theme.bright} attributes={TextAttributes.BOLD}>
                  {experience.position}
                </text>
                <text fg={theme.muted}>{experience.company}</text>
              </box>
              <box flexDirection="column" alignItems={wide ? "flex-end" : "flex-start"}>
                <text fg={theme.subtle}>{experience.period}</text>
                <text fg={theme.subtle}>{experience.location}</text>
              </box>
            </box>

            <text fg={theme.muted} marginTop={1}>
              {experience.description}
            </text>

            <box flexDirection="column" marginY={1}>
              {experience.responsibilities.map((item) => (
                <box key={item} flexDirection="row" gap={1}>
                  <text fg={theme.faint}>•</text>
                  <text fg={theme.muted} flexShrink={1}>
                    {item}
                  </text>
                </box>
              ))}
            </box>

            <Pills items={experience.technologies} />
          </box>
        ))}
      </ScrollPage>
    </InfoLayout>
  );
}
