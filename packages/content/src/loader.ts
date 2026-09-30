import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { articleSchema, type ArticleData } from "./articles.ts";
import { articlesDir, draftsDir } from "./paths.ts";

export type LoadedArticle = {
  data: ArticleData;
  body: string;
  file: string;
  draft: boolean;
  /** Markdown image `src` exactly as written, mapped to an absolute path on disk. */
  images: Record<string, string>;
};

export type LoadResult = {
  articles: LoadedArticle[];
  skipped: Array<{ file: string; reason: string }>;
};

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const imagePattern = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;

function listMarkdown(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => join(dir, file))
    .sort();
}

function resolveImages(body: string, file: string): Record<string, string> {
  const images: Record<string, string> = {};
  // Drafts share the published assets folder, so fall back to it when a relative path misses.
  const searchRoots = [dirname(file), articlesDir];

  for (const [, src] of body.matchAll(imagePattern)) {
    if (!src || /^[a-z]+:/i.test(src) || src in images) continue;
    const found = searchRoots
      .map((root) => resolve(root, src))
      .find((candidate) => existsSync(candidate));
    if (found) images[src] = found;
  }

  return images;
}

function loadFile(file: string, draft: boolean): LoadedArticle | string {
  const raw = readFileSync(file, "utf8");
  const match = raw.match(frontmatterPattern);
  if (!match) return "missing frontmatter";

  const parsed = articleSchema.safeParse(parseYaml(match[1] ?? "") ?? {});
  if (!parsed.success) {
    return parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
  }

  const body = raw.slice(match[0].length);
  return { data: parsed.data, body, file, draft, images: resolveImages(body, file) };
}

/** Reads markdown articles from disk. Only for build tooling; clients should embed the result. */
export function loadArticles(options: { drafts?: boolean } = {}): LoadResult {
  const sources = [
    ...listMarkdown(articlesDir).map((file) => ({ file, draft: false })),
    ...(options.drafts ? listMarkdown(draftsDir).map((file) => ({ file, draft: true })) : []),
  ];

  const result: LoadResult = { articles: [], skipped: [] };
  for (const { file, draft } of sources) {
    const loaded = loadFile(file, draft);
    if (typeof loaded === "string") {
      result.skipped.push({ file: relative(process.cwd(), file), reason: loaded });
    } else {
      result.articles.push(loaded);
    }
  }

  result.articles.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  return result;
}
