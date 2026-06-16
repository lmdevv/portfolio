import { glob } from "astro/loaders";
import { z, defineCollection } from "astro:content";

const articles = defineCollection({
    loader: glob({ pattern: ["**/*.md", "**/*.mdx"], base: "./src/content/articles" }),
    schema: () => z.object({
        title: z.string(),
        slug: z.string(),
        snippet: z.string(),
        category: z.string(),
        pubDate: z.coerce.date(),
        readingDuration: z.number(),
        author: z.string().default('Luis Mario Agreda'),
    }),
});

export const collections = { articles };
