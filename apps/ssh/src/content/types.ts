import type { ArticleData } from "@portfolio/content";

export type EmbeddedArticle = Omit<ArticleData, "pubDate"> & {
  pubDate: string;
  draft: boolean;
  body: string;
  /** Markdown image `src` mapped to an embedded file path readable with `Bun.file`. */
  images: Record<string, string>;
};

export type Article = Omit<EmbeddedArticle, "pubDate"> & { pubDate: Date };
