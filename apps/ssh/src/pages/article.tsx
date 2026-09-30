import { TextAttributes } from "@opentui/core";
import { formatDate } from "@portfolio/content";
import { findArticle, relatedArticles } from "../content/articles.ts";
import { ArticleBody } from "../components/article-body.tsx";
import { InfoLayout, useContentWidth } from "../components/layout.tsx";
import { ScrollPage } from "../components/scroll-page.tsx";
import { useApp } from "../state.tsx";
import { theme, zinc } from "../theme.ts";
import { ArticleMeta } from "./blog.tsx";
import { NotFoundPage } from "./not-found.tsx";

const READING_WIDTH = 88;

export function ArticlePage(props: { slug: string }) {
  const { navigate } = useApp();
  const width = Math.min(useContentWidth(), READING_WIDTH);
  const article = findArticle(props.slug);

  if (!article) return <NotFoundPage path={`/blog/${props.slug}`} />;
  const related = relatedArticles(article);

  return (
    <InfoLayout>
      <ScrollPage>
        <box flexDirection="column" width={width} flexShrink={0}>
          <box flexDirection="row" marginBottom={1}>
            <box backgroundColor={theme.surface} paddingX={1}>
              <text fg={theme.muted}>{article.category}</text>
            </box>
          </box>
          <text fg={theme.bright} attributes={TextAttributes.BOLD}>
            {article.title}
          </text>
          <ArticleMeta article={article} author />
          <text fg={theme.faint} marginY={1}>
            {"─".repeat(width)}
          </text>
        </box>

        <ArticleBody article={article} width={width} />

        {related.length > 0 && (
          <box flexDirection="column" marginTop={2} width={width}>
            <text fg={theme.faint}>{"─".repeat(width)}</text>
            <text fg={theme.muted} attributes={TextAttributes.BOLD} marginY={1}>
              Related Articles
            </text>
            {related.map((other) => (
              <box
                key={other.slug}
                flexDirection="column"
                marginBottom={1}
                onMouseDown={() => navigate({ page: "article", slug: other.slug })}
              >
                <text fg={zinc[50]}>
                  <u>{other.title}</u>
                </text>
                <text fg={theme.subtle}>
                  {formatDate(other.pubDate)} · {other.author}
                </text>
              </box>
            ))}
          </box>
        )}

        <text fg={theme.faint} marginTop={1}>
          esc back to the blog · j/k scroll · i image mode
        </text>
      </ScrollPage>
    </InfoLayout>
  );
}
