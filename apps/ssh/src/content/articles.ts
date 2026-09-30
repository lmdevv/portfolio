import { articles as embedded } from "../generated/content.ts";
import type { Article } from "./types.ts";

export const articles: Article[] = embedded.map((article) => ({
  ...article,
  pubDate: new Date(article.pubDate),
}));

export const categories = [...new Set(articles.map((article) => article.category))];

export function findArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function relatedArticles(article: Article) {
  return articles.filter(
    (other) => other.category === article.category && other.slug !== article.slug,
  );
}
