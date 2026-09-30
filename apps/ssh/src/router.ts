import { categoryToSlug } from "@portfolio/content";
import { categories, findArticle } from "./content/articles.ts";

export type Route =
  | { page: "home" }
  | { page: "projects" }
  | { page: "experience" }
  | { page: "blog"; category?: string }
  | { page: "article"; slug: string }
  | { page: "about" }
  | { page: "contact" }
  | { page: "not-found"; path: string };

export type TopLevelPage = "home" | "projects" | "experience" | "blog" | "about" | "contact";

export const navItems: Array<{ page: TopLevelPage; label: string; key: string }> = [
  { page: "home", label: "Home", key: "1" },
  { page: "projects", label: "Projects", key: "2" },
  { page: "experience", label: "Experience", key: "3" },
  { page: "blog", label: "Blog", key: "4" },
  { page: "about", label: "About", key: "5" },
  { page: "contact", label: "Contact", key: "6" },
];

/** The top-level section a route belongs to, for highlighting the nav. */
export function sectionOf(route: Route): TopLevelPage | undefined {
  if (route.page === "article") return "blog";
  if (route.page === "not-found") return undefined;
  return route.page;
}

/**
 * Accepts web-style paths (`/blog/some-slug`, `/blog/category/traveling`) and bare slugs,
 * so `ssh -t host /blog` and `ssh -t host some-slug` both land somewhere useful.
 */
export function parseRoute(input: string | undefined): Route {
  const path = (input ?? "").trim().replace(/^\/+|\/+$/g, "");
  const [head, ...rest] = path.split("/").filter(Boolean);

  switch (head) {
    case undefined:
    case "home":
      return { page: "home" };
    case "projects":
    case "experience":
    case "about":
    case "contact":
      return rest.length === 0 ? { page: head } : { page: "not-found", path: `/${path}` };
    case "blog": {
      if (rest.length === 0) return { page: "blog" };
      if (rest[0] === "category" && rest[1]) {
        const category = categories.find((name) => categoryToSlug(name) === rest[1]);
        return category ? { page: "blog", category } : { page: "not-found", path: `/${path}` };
      }
      const slug = rest.join("/");
      return findArticle(slug) ? { page: "article", slug } : { page: "not-found", path: `/${path}` };
    }
    default:
      return findArticle(path) ? { page: "article", slug: path } : { page: "not-found", path: `/${path}` };
  }
}

export function routeToPath(route: Route): string {
  switch (route.page) {
    case "home":
      return "/";
    case "blog":
      return route.category ? `/blog/category/${categoryToSlug(route.category)}` : "/blog";
    case "article":
      return `/blog/${route.slug}`;
    case "not-found":
      return route.path;
    default:
      return `/${route.page}`;
  }
}
