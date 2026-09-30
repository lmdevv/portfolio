import { TextAttributes } from "@opentui/core";
import { projects, type Project, type ProjectLinkKind } from "@portfolio/content";
import { displayUrl, useCopy } from "../components/clipboard.ts";
import { InfoLayout, useContentWidth } from "../components/layout.tsx";
import { PageTitle } from "../components/page-title.tsx";
import { Pills, Topics } from "../components/pills.tsx";
import { ScrollPage } from "../components/scroll-page.tsx";
import { useListSelection } from "../components/selection.ts";
import { theme } from "../theme.ts";

const linkGlyph: Record<ProjectLinkKind, string> = { web: "◎", github: "◆", store: "▣" };

function ProjectCard(props: { project: Project; index: number; selected: boolean; onSelect: () => void }) {
  const { project, selected } = props;

  return (
    <box
      id={`project-${props.index}`}
      border
      borderStyle="rounded"
      borderColor={selected ? theme.borderActive : theme.border}
      paddingX={1}
      flexDirection="column"
      flexGrow={1}
      flexBasis={0}
      onMouseDown={props.onSelect}
    >
      <box flexDirection="row" justifyContent="space-between" gap={2}>
        <text fg={selected ? theme.bright : theme.strong} attributes={TextAttributes.BOLD}>
          {selected ? "› " : ""}
          {project.title}
        </text>
        {project.homepage && (
          <text fg={theme.subtle}>
            <a href={project.homepage.url}>
              {linkGlyph[project.homepage.kind]} {project.homepage.label}
            </a>
          </text>
        )}
      </box>
      <text fg={theme.muted} marginY={1}>
        {project.description}
      </text>
      <Pills items={project.languages} />
      <box marginTop={1}>
        <Topics items={project.topics} />
      </box>
      <text fg={theme.faint}>
        <a href={project.url}>↗ {displayUrl(project.url)}</a>
      </text>
    </box>
  );
}

export function ProjectsPage() {
  const copy = useCopy();
  const columns = useContentWidth() >= 110 ? 2 : 1;
  const { index, setIndex, onKey, scroll } = useListSelection(projects.length, "project");

  const rows: Project[][] = [];
  for (let start = 0; start < projects.length; start += columns) rows.push(projects.slice(start, start + columns));

  return (
    <InfoLayout>
      <PageTitle title="Projects" subtitle="j/k select · y copy repo · Y copy live link · links are clickable" />
      <ScrollPage
        ref={scroll}
        lineKeys={false}
        onKey={(key) => {
          if (onKey(key)) return;
          const project = projects[index];
          if (!project) return;
          if (key.name === "y" && key.shift && project.homepage) copy(project.homepage.url);
          else if (key.name === "y" || key.name === "return") copy(project.url);
          else if (columns === 2 && (key.name === "l" || key.name === "right")) setIndex(Math.min(projects.length - 1, index + 1));
          else if (columns === 2 && (key.name === "h" || key.name === "left")) setIndex(Math.max(0, index - 1));
        }}
      >
        {rows.map((row, rowIndex) => (
          <box key={rowIndex} flexDirection="row" gap={2} marginBottom={1}>
            {row.map((project, column) => {
              const projectIndex = rowIndex * columns + column;
              return (
                <ProjectCard
                  key={project.title}
                  project={project}
                  index={projectIndex}
                  selected={projectIndex === index}
                  onSelect={() => setIndex(projectIndex)}
                />
              );
            })}
            {row.length < columns && <box flexGrow={1} flexBasis={0} />}
          </box>
        ))}
      </ScrollPage>
    </InfoLayout>
  );
}
