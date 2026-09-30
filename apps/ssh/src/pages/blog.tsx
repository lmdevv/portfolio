import { TextAttributes } from "@opentui/core";
import { formatDate } from "@portfolio/content";
import { useState } from "react";
import { articles, categories } from "../content/articles.ts";
import type { Article } from "../content/types.ts";
import { InfoLayout } from "../components/layout.tsx";
import { PageTitle } from "../components/page-title.tsx";
import { ScrollPage } from "../components/scroll-page.tsx";
import { useListSelection } from "../components/selection.ts";
import { useApp } from "../state.tsx";
import { theme, zinc } from "../theme.ts";

const tabs = ["All", ...categories];

export function ArticleMeta(props: { article: Article; author?: boolean }) {
  const { article } = props;
  return (
    <text fg={theme.subtle}>
      {props.author ? `${article.author} · ` : ""}
      {formatDate(article.pubDate)} · {article.readingDuration} min read
      {article.draft && (
        <>
          {"  "}
          <span fg={zinc[950]} bg={zinc[400]}>
            {" draft "}
          </span>
        </>
      )}
    </text>
  );
}

function EmptyState() {
  return (
    <box flexDirection="column" marginTop={1}>
      <text fg={theme.faint}>{"  ┌────────────────────┐\n  │ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔   │\n  │ ▔▔▔▔▔▔▔▔▔▔▔        │\n  │ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔    │\n  │ ▔▔▔▔▔▔▔ ▌          │\n  └────────────────────┘"}</text>
      <text fg={theme.muted} marginTop={1}>
        Nothing published yet. Posts are on the way.
      </text>
    </box>
  );
}

export function BlogPage(props: { category?: string }) {
  const { navigate } = useApp();
  const [tab, setTab] = useState(Math.max(0, tabs.indexOf(props.category ?? "All")));
  const category = tab === 0 ? undefined : tabs[tab];
  const visible = category ? articles.filter((article) => article.category === category) : articles;
  const { index, setIndex, onKey, scroll } = useListSelection(visible.length, "article");

  const switchTab = (next: number) => {
    setTab((next + tabs.length) % tabs.length);
    setIndex(0);
  };

  return (
    <InfoLayout>
      <PageTitle title="Blog" />

      {categories.length > 0 && (
        <box flexDirection="row" gap={1} marginBottom={1} flexShrink={0}>
          {tabs.map((name, tabIndex) => {
            const active = tabIndex === tab;
            return (
              <box key={name} paddingX={2} backgroundColor={active ? zinc[700] : undefined} onMouseDown={() => switchTab(tabIndex)}>
                <text fg={active ? theme.bright : theme.muted}>{name}</text>
              </box>
            );
          })}
          <text fg={theme.faint} marginLeft={2}>
            ← → category
          </text>
        </box>
      )}

      <ScrollPage
        ref={scroll}
        lineKeys={false}
        onKey={(key) => {
          if (onKey(key)) return;
          if (key.name === "left" || key.name === "h" || key.name === "[") switchTab(tab - 1);
          else if (key.name === "right" || key.name === "l" || key.name === "]") switchTab(tab + 1);
          else if (key.name === "return") {
            const article = visible[index];
            if (article) navigate({ page: "article", slug: article.slug });
          }
        }}
      >
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          visible.map((article, articleIndex) => {
            const selected = articleIndex === index;
            return (
              <box
                id={`article-${articleIndex}`}
                key={article.slug}
                flexDirection="column"
                marginBottom={1}
                paddingLeft={1}
                border={["left"]}
                borderColor={selected ? theme.muted : theme.bg}
                onMouseDown={() => (selected ? navigate({ page: "article", slug: article.slug }) : setIndex(articleIndex))}
              >
                <text fg={selected ? theme.bright : theme.text} attributes={TextAttributes.BOLD}>
                  {article.title}
                </text>
                {article.snippet && <text fg={theme.muted}>{article.snippet}</text>}
                <ArticleMeta article={article} />
              </box>
            );
          })
        )}
      </ScrollPage>
    </InfoLayout>
  );
}
