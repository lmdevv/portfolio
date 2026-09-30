import { z } from "zod";

export const articleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  snippet: z.string(),
  category: z.string(),
  pubDate: z.coerce.date(),
  readingDuration: z.number(),
  author: z.string().default("Luis Mario Agreda"),
});

export type ArticleData = z.infer<typeof articleSchema>;

export function categoryToSlug(category: string) {
  return category.toLowerCase().replaceAll(" ", "-");
}

/** Frontmatter dates parse as UTC midnight, so format in UTC to avoid shifting to the previous day. */
export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
