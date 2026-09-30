import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { articleSchema } from "@portfolio/content";
import { articlesDir } from "@portfolio/content/paths";

const articles = defineCollection({
    loader: glob({ pattern: ["**/*.md", "**/*.mdx"], base: articlesDir }),
    schema: articleSchema,
});

export const collections = { articles };
